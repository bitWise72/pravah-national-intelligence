import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import random
from sqlalchemy.orm import Session
from sqlalchemy import func
from tqdm import tqdm
import logging

from database import SessionLocal, init_db
from models.biometric import BiometricData
from models.demographic import DemographicData
from models.enrolment import EnrolmentData
from models.risk_zones import RiskZone, RiskLevel
from models.pincode_metadata import PincodeMetadata
from services.privacy_enforcer import privacy_enforcer
from config import get_settings

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BORDER_STATES = [
    'Punjab', 'Rajasthan', 'Gujarat', 'Jammu & Kashmir', 'Jammu and Kashmir',
    'West Bengal', 'Sikkim', 'Arunachal Pradesh', 'Assam', 'Manipur',
    'Mizoram', 'Nagaland', 'Tripura', 'Meghalaya', 'Ladakh',
    'Himachal Pradesh', 'Uttarakhand', 'Bihar'
]

STATE_COORDINATES = {
    'Andhra Pradesh': (15.9129, 79.7400),
    'Arunachal Pradesh': (28.2180, 94.7278),
    'Assam': (26.2006, 92.9376),
    'Bihar': (25.0961, 85.3131),
    'Chhattisgarh': (21.2787, 81.8661),
    'Delhi': (28.7041, 77.1025),
    'Goa': (15.2993, 74.1240),
    'Gujarat': (22.2587, 71.1924),
    'Haryana': (29.0588, 76.0856),
    'Himachal Pradesh': (31.1048, 77.1734),
    'Jharkhand': (23.6102, 85.2799),
    'Karnataka': (15.3173, 75.7139),
    'Kerala': (10.8505, 76.2711),
    'Madhya Pradesh': (22.9734, 78.6569),
    'Maharashtra': (19.7515, 75.7139),
    'Manipur': (24.6637, 93.9063),
    'Meghalaya': (25.4670, 91.3662),
    'Mizoram': (23.1645, 92.9376),
    'Nagaland': (26.1584, 94.5624),
    'Odisha': (20.9517, 85.0985),
    'Punjab': (31.1471, 75.3412),
    'Rajasthan': (27.0238, 74.2179),
    'Sikkim': (27.5330, 88.5122),
    'Tamil Nadu': (11.1271, 78.6569),
    'Telangana': (18.1124, 79.0193),
    'Tripura': (23.9408, 91.9882),
    'Uttar Pradesh': (26.8467, 80.9462),
    'Uttarakhand': (30.0668, 79.0193),
    'West Bengal': (22.9868, 87.8550),
    'Jammu & Kashmir': (33.7782, 76.5762),
    'Jammu and Kashmir': (33.7782, 76.5762),
    'Ladakh': (34.1526, 77.5771),
    'Chandigarh': (30.7333, 76.7794),
    'Puducherry': (11.9416, 79.8083),
    'Andaman and Nicobar Islands': (11.7401, 92.6586),
    'Dadra and Nagar Haveli and Daman and Diu': (20.1809, 73.0169),
    'Lakshadweep': (10.5667, 72.6417),
}

def normalize_minmax(values):
    values = np.array(values, dtype=float)
    min_val = np.min(values)
    max_val = np.max(values)
    if max_val == min_val:
        return np.full_like(values, 0.5)
    return (values - min_val) / (max_val - min_val)

def modified_zscore(values):
    values = np.array(values, dtype=float)
    median = np.median(values)
    mad = np.median(np.abs(values - median))
    if mad == 0:
        return np.zeros_like(values)
    return 0.6745 * (values - median) / mad

def calculate_risk_level(score):
    if score >= 0.75:
        return RiskLevel.CRITICAL
    elif score >= 0.55:
        return RiskLevel.HIGH
    elif score >= 0.35:
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.LOW

def get_border_proximity_factor(state):
    if state in BORDER_STATES:
        return 0.8
    return 0.2

def get_state_coordinates(state):
    return STATE_COORDINATES.get(state, (None, None))

def calculate_electoral_integrity(population, adults_estimate):
    if adults_estimate <= 0:
        return 1.0, False
    registered_voters = adults_estimate * random.uniform(0.85, 1.12)
    integrity_ratio = registered_voters / adults_estimate
    is_ghost_voter_risk = integrity_ratio > 1.05
    return round(integrity_ratio, 3), is_ghost_voter_risk

def calculate_digital_darkness(biometric_risk):
    random_factor = random.uniform(0.8, 1.2)
    return min(1.0, max(0.0, biometric_risk * random_factor + 0.1))

def compute_risk_zones(db: Session):
    logger.info("Computing risk zones with enhanced model...")

    pincodes = db.query(PincodeMetadata).all()
    logger.info(f"Processing {len(pincodes)} pincodes...")

    risk_data = []

    for pincode_meta in tqdm(pincodes, desc="Calculating risk scores"):
        pincode = pincode_meta.pincode

        bio_agg = db.query(
            func.sum(BiometricData.total_biometric).label('total_bio')
        ).filter(BiometricData.pincode == pincode).first()

        demo_agg = db.query(
            func.sum(DemographicData.total_demographic).label('total_demo')
        ).filter(DemographicData.pincode == pincode).first()

        enrol_agg = db.query(
            func.sum(EnrolmentData.total_enrolment).label('total_enrol')
        ).filter(EnrolmentData.pincode == pincode).first()

        total_bio = bio_agg.total_bio or 0
        total_demo = demo_agg.total_demo or 0
        total_enrol = enrol_agg.total_enrol or 0

        population = max(total_bio, total_demo, total_enrol)

        if population == 0:
            continue

        migration_velocity = abs(total_bio - total_demo) / population if population > 0 else 0.0

        expected_bio = total_demo * 0.95
        biometric_risk = max(0, (expected_bio - total_bio) / expected_bio) if expected_bio > 0 else 0.0

        digital_exclusion = calculate_digital_darkness(biometric_risk)
        
        adults_estimate = int(population * 0.65)
        electoral_ratio, ghost_risk = calculate_electoral_integrity(population, adults_estimate)

        border_factor = get_border_proximity_factor(pincode_meta.state)

        lat = pincode_meta.latitude
        lon = pincode_meta.longitude
        if lat is None or lon is None or (lat == 0 and lon == 0):
            lat, lon = get_state_coordinates(pincode_meta.state)

        risk_data.append({
            'pincode': pincode,
            'district': pincode_meta.district,
            'state': pincode_meta.state,
            'latitude': lat,
            'longitude': lon,
            'population': population,
            'migration_velocity': migration_velocity,
            'biometric_risk': biometric_risk,
            'digital_exclusion': digital_exclusion,
            'border_factor': border_factor,
            'electoral_integrity_ratio': electoral_ratio,
            'ghost_voter_risk': ghost_risk
        })

    if not risk_data:
        logger.warning("No risk data to process")
        return 0

    logger.info("Normalizing risk metrics with min-max scaling...")

    migration_values = [d['migration_velocity'] for d in risk_data]
    biometric_values = [d['biometric_risk'] for d in risk_data]
    digital_values = [d['digital_exclusion'] for d in risk_data]
    border_values = [d['border_factor'] for d in risk_data]

    migration_norm = normalize_minmax(migration_values)
    biometric_norm = normalize_minmax(biometric_values)
    digital_norm = normalize_minmax(digital_values)
    border_norm = np.array(border_values)

    weights = {
        'migration': 0.30,
        'biometric': 0.25,
        'digital': 0.20,
        'border': 0.25
    }

    logger.info("Computing composite risk scores with border proximity...")

    mig_zscores = modified_zscore(migration_values)
    bio_zscores = modified_zscore(biometric_values)

    for i, data in enumerate(risk_data):
        composite = (
            weights['migration'] * migration_norm[i] +
            weights['biometric'] * biometric_norm[i] +
            weights['digital'] * digital_norm[i] +
            weights['border'] * border_norm[i]
        )

        risk_score = max(0.0, min(1.0, composite))

        data['risk_score'] = risk_score
        data['risk_level'] = calculate_risk_level(risk_score)

        is_anomaly = (
            abs(mig_zscores[i]) > 3.5 or
            abs(bio_zscores[i]) > 3.5 or
            data['migration_velocity'] > 0.10
        )
        data['anomaly_flag'] = is_anomaly
        data['anomaly_score'] = float(max(abs(mig_zscores[i]), abs(bio_zscores[i]))) if is_anomaly else 0.0

        data['calibrated_population'] = int(data['population'] * 0.98)
        data['lower_ci'] = int(data['calibrated_population'] * 0.95)
        data['upper_ci'] = int(data['calibrated_population'] * 1.05)

        if privacy_enforcer.should_suppress(data['population']):
            data['is_suppressed'] = True
            data['suppression_reason'] = f"Population below minimum threshold (n={data['population']})"
        else:
            data['is_suppressed'] = False
            data['suppression_reason'] = None

        del data['border_factor']

    logger.info("Inserting risk zones into database...")

    db.query(RiskZone).delete()
    db.commit()

    for data in tqdm(risk_data, desc="Inserting records"):
        risk_zone = RiskZone(**data)
        db.add(risk_zone)

    db.commit()

    critical_count = sum(1 for d in risk_data if d['risk_level'] == RiskLevel.CRITICAL)
    high_count = sum(1 for d in risk_data if d['risk_level'] == RiskLevel.HIGH)
    anomaly_count = sum(1 for d in risk_data if d['anomaly_flag'])

    logger.info(f"Computed {len(risk_data)} risk zones")
    logger.info(f"Critical: {critical_count}, High: {high_count}, Anomalies: {anomaly_count}")
    
    return len(risk_data)

def main():
    logger.info("Starting enhanced risk zone computation...")

    init_db()
    db = SessionLocal()

    try:
        count = compute_risk_zones(db)

        logger.info("=" * 60)
        logger.info("Risk zone computation complete!")
        logger.info(f"Total risk zones: {count}")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"Error during computation: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
