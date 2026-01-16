"""
Compute Risk Zones Script
Calculates composite risk scores and populates risk_zones table.
"""
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
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


def normalize_zscore(values):
    """Normalize values using z-score."""
    values = np.array(values)
    mean = np.mean(values)
    std = np.std(values)
    if std == 0:
        return np.zeros_like(values)
    return (values - mean) / std


def calculate_risk_level(score):
    """Determine risk level from score."""
    if score >= 0.75:
        return RiskLevel.CRITICAL
    elif score >= 0.60:
        return RiskLevel.HIGH
    elif score >= 0.40:
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.LOW


def compute_risk_zones(db: Session):
    """Compute risk zones from aggregated data."""
    logger.info("Computing risk zones...")
    
    # Get all unique pincodes with metadata
    pincodes = db.query(PincodeMetadata).all()
    
    logger.info(f"Processing {len(pincodes)} pincodes...")
    
    risk_data = []
    
    for pincode_meta in tqdm(pincodes, desc="Calculating risk scores"):
        pincode = pincode_meta.pincode
        
        # Aggregate biometric data
        bio_agg = db.query(
            func.sum(BiometricData.total_biometric).label('total_bio')
        ).filter(BiometricData.pincode == pincode).first()
        
        # Aggregate demographic data
        demo_agg = db.query(
            func.sum(DemographicData.total_demographic).label('total_demo')
        ).filter(DemographicData.pincode == pincode).first()
        
        # Aggregate enrolment data
        enrol_agg = db.query(
            func.sum(EnrolmentData.total_enrolment).label('total_enrol')
        ).filter(EnrolmentData.pincode == pincode).first()
        
        total_bio = bio_agg.total_bio or 0
        total_demo = demo_agg.total_demo or 0
        total_enrol = enrol_agg.total_enrol or 0
        
        # Calculate population estimate
        population = max(total_bio, total_demo, total_enrol)
        
        if population == 0:
            continue
        
        # Calculate risk metrics (simplified formulas)
        # Migration velocity: difference between bio and demo as proportion
        migration_velocity = abs(total_bio - total_demo) / population if population > 0 else 0.0
        
        # Biometric risk: deficit in biometric enrollment
        expected_bio = total_demo * 0.95  # Expect 95% biometric enrollment
        biometric_risk = max(0, (expected_bio - total_bio) / expected_bio) if expected_bio > 0 else 0.0
        
        # Digital exclusion: simplified metric (would use actual digital data in production)
        digital_exclusion = 0.3 + (0.4 * biometric_risk)  # Correlated with biometric risk
        
        risk_data.append({
            'pincode': pincode,
            'district': pincode_meta.district,
            'state': pincode_meta.state,
            'latitude': pincode_meta.latitude,
            'longitude': pincode_meta.longitude,
            'population': population,
            'migration_velocity': migration_velocity,
            'biometric_risk': biometric_risk,
            'digital_exclusion': digital_exclusion
        })
    
    if not risk_data:
        logger.warning("No risk data to process")
        return 0
    
    # Normalize metrics using z-score
    logger.info("Normalizing risk metrics...")
    
    migration_values = [d['migration_velocity'] for d in risk_data]
    biometric_values = [d['biometric_risk'] for d in risk_data]
    digital_values = [d['digital_exclusion'] for d in risk_data]
    
    migration_norm = normalize_zscore(migration_values)
    biometric_norm = normalize_zscore(biometric_values)
    digital_norm = normalize_zscore(digital_values)
    
    # Calculate composite risk scores with weights
    weights = {
        'migration': 0.3,
        'biometric': 0.4,
        'digital': 0.3
    }
    
    logger.info("Computing composite risk scores...")
    
    for i, data in enumerate(risk_data):
        # Composite score (normalized to 0-1)
        composite = (
            weights['migration'] * migration_norm[i] +
            weights['biometric'] * biometric_norm[i] +
            weights['digital'] * digital_norm[i]
        )
        
        # Normalize to 0-1 range
        risk_score = (composite + 3) / 6  # Assuming z-scores typically in [-3, 3]
        risk_score = max(0.0, min(1.0, risk_score))
        
        data['risk_score'] = risk_score
        data['risk_level'] = calculate_risk_level(risk_score)
        
        # Simple anomaly detection (threshold-based)
        data['anomaly_flag'] = (
            data['migration_velocity'] > 0.08 or
            data['biometric_risk'] > 0.7
        )
        data['anomaly_score'] = -0.5 if data['anomaly_flag'] else 0.0
        
        # Calibrated population (simplified Fay-Herriot)
        data['calibrated_population'] = int(data['population'] * 0.98)
        data['lower_ci'] = int(data['calibrated_population'] * 0.95)
        data['upper_ci'] = int(data['calibrated_population'] * 1.05)
        
        # Privacy enforcement
        if privacy_enforcer.should_suppress(data['population']):
            data['is_suppressed'] = True
            data['suppression_reason'] = f"Population below minimum threshold (n={data['population']})"
        else:
            data['is_suppressed'] = False
            data['suppression_reason'] = None
    
    # Insert into database
    logger.info("Inserting risk zones into database...")
    
    for data in tqdm(risk_data, desc="Inserting records"):
        risk_zone = RiskZone(**data)
        db.merge(risk_zone)  # Use merge to handle duplicates
    
    db.commit()
    
    logger.info(f"Computed {len(risk_data)} risk zones")
    return len(risk_data)


def main():
    """Main function."""
    logger.info("Starting risk zone computation...")
    
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
