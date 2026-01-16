"""
Data Ingestion Script
Processes CSV files from extracted_data and loads into PostgreSQL database.
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session
from tqdm import tqdm
import logging

from database import SessionLocal, init_db
from models.biometric import BiometricData
from models.demographic import DemographicData
from models.enrolment import EnrolmentData
from models.pincode_metadata import PincodeMetadata
from services.pincode_service import pincode_service
from config import get_settings

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def parse_date(date_str: str):
    """Parse date string in DD-MM-YYYY format."""
    try:
        return datetime.strptime(date_str, "%d-%m-%Y").date()
    except:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except:
            logger.warning(f"Could not parse date: {date_str}")
            return None


def ingest_biometric_data(db: Session, data_path: Path):
    """Ingest biometric CSV files."""
    logger.info("Ingesting biometric data...")
    
    bio_dir = data_path / "biometric" / "api_data_aadhar_biometric"
    csv_files = list(bio_dir.glob("*.csv"))
    
    total_records = 0
    
    for csv_file in csv_files:
        logger.info(f"Processing {csv_file.name}...")
        
        # Read CSV in chunks
        for chunk in pd.read_csv(csv_file, chunksize=10000):
            records = []
            
            for _, row in chunk.iterrows():
                date_val = parse_date(str(row['date']))
                if not date_val:
                    continue
                
                bio_0_5 = int(row.get('bio_age_0_5', 0))
                bio_5_17 = int(row.get('bio_age_5_17', 0))
                bio_17_plus = int(row.get('bio_age_17_', 0))  # Note: column name has trailing underscore
                
                record = BiometricData(
                    date=date_val,
                    state=str(row['state']),
                    district=str(row['district']),
                    pincode=str(row['pincode']).zfill(6),
                    bio_age_0_5=bio_0_5,
                    bio_age_5_17=bio_5_17,
                    bio_age_17_plus=bio_17_plus,
                    total_biometric=bio_0_5 + bio_5_17 + bio_17_plus
                )
                records.append(record)
            
            # Bulk insert
            db.bulk_save_objects(records)
            db.commit()
            total_records += len(records)
    
    logger.info(f"Ingested {total_records} biometric records")
    return total_records


def ingest_demographic_data(db: Session, data_path: Path):
    """Ingest demographic CSV files."""
    logger.info("Ingesting demographic data...")
    
    demo_dir = data_path / "demographic" / "api_data_aadhar_demographic"
    csv_files = list(demo_dir.glob("*.csv"))
    
    total_records = 0
    
    for csv_file in csv_files:
        logger.info(f"Processing {csv_file.name}...")
        
        for chunk in pd.read_csv(csv_file, chunksize=10000):
            records = []
            
            for _, row in chunk.iterrows():
                date_val = parse_date(str(row['date']))
                if not date_val:
                    continue
                
                demo_0_5 = int(row.get('demo_age_0_5', 0))
                demo_5_17 = int(row.get('demo_age_5_17', 0))
                demo_17_plus = int(row.get('demo_age_17_', 0))
                
                record = DemographicData(
                    date=date_val,
                    state=str(row['state']),
                    district=str(row['district']),
                    pincode=str(row['pincode']).zfill(6),
                    demo_age_0_5=demo_0_5,
                    demo_age_5_17=demo_5_17,
                    demo_age_17_plus=demo_17_plus,
                    total_demographic=demo_0_5 + demo_5_17 + demo_17_plus
                )
                records.append(record)
            
            db.bulk_save_objects(records)
            db.commit()
            total_records += len(records)
    
    logger.info(f"Ingested {total_records} demographic records")
    return total_records


def ingest_enrolment_data(db: Session, data_path: Path):
    """Ingest enrolment CSV files."""
    logger.info("Ingesting enrolment data...")
    
    enrol_dir = data_path / "enrolment" / "api_data_aadhar_enrolment"
    csv_files = list(enrol_dir.glob("*.csv"))
    
    total_records = 0
    
    for csv_file in csv_files:
        logger.info(f"Processing {csv_file.name}...")
        
        for chunk in pd.read_csv(csv_file, chunksize=10000):
            records = []
            
            for _, row in chunk.iterrows():
                date_val = parse_date(str(row['date']))
                if not date_val:
                    continue
                
                age_0_5 = int(row.get('age_0_5', 0))
                age_5_17 = int(row.get('age_5_17', 0))
                age_18_plus = int(row.get('age_18_greater', 0))
                
                record = EnrolmentData(
                    date=date_val,
                    state=str(row['state']),
                    district=str(row['district']),
                    pincode=str(row['pincode']).zfill(6),
                    age_0_5=age_0_5,
                    age_5_17=age_5_17,
                    age_18_greater=age_18_plus,
                    total_enrolment=age_0_5 + age_5_17 + age_18_plus
                )
                records.append(record)
            
            db.bulk_save_objects(records)
            db.commit()
            total_records += len(records)
    
    logger.info(f"Ingested {total_records} enrolment records")
    return total_records


def enrich_pincodes(db: Session):
    """Enrich unique pincodes with location metadata."""
    logger.info("Enriching pincodes with location data...")
    
    # Get unique pincodes from all tables
    from sqlalchemy import select, union_all
    
    bio_pincodes = select(BiometricData.pincode).distinct()
    demo_pincodes = select(DemographicData.pincode).distinct()
    enrol_pincodes = select(EnrolmentData.pincode).distinct()
    
    all_pincodes_query = union_all(bio_pincodes, demo_pincodes, enrol_pincodes)
    unique_pincodes = db.execute(select(all_pincodes_query.c.pincode).distinct()).scalars().all()
    
    logger.info(f"Found {len(unique_pincodes)} unique pincodes")
    
    enriched_count = 0
    
    for pincode in tqdm(unique_pincodes, desc="Enriching pincodes"):
        # Check if already exists
        existing = db.query(PincodeMetadata).filter(PincodeMetadata.pincode == pincode).first()
        if existing:
            continue
        
        # Fetch from postal API
        pincode_info = pincode_service.get_pincode_info_sync(pincode)
        
        if pincode_info:
            metadata = PincodeMetadata(**pincode_info)
            db.add(metadata)
            enriched_count += 1
            
            # Commit every 100 records
            if enriched_count % 100 == 0:
                db.commit()
    
    db.commit()
    logger.info(f"Enriched {enriched_count} pincodes")
    return enriched_count


def main():
    """Main ingestion function."""
    logger.info("Starting data ingestion...")
    logger.info(f"Data path: {settings.data_path}")
    
    # Initialize database
    init_db()
    
    # Create session
    db = SessionLocal()
    
    try:
        data_path = Path(settings.data_path)
        
        if not data_path.exists():
            logger.error(f"Data path does not exist: {data_path}")
            return
        
        # Ingest all data types
        bio_count = ingest_biometric_data(db, data_path)
        demo_count = ingest_demographic_data(db, data_path)
        enrol_count = ingest_enrolment_data(db, data_path)
        
        # Enrich pincodes
        pincode_count = enrich_pincodes(db)
        
        logger.info("=" * 60)
        logger.info("Data ingestion complete!")
        logger.info(f"Biometric records: {bio_count}")
        logger.info(f"Demographic records: {demo_count}")
        logger.info(f"Enrolment records: {enrol_count}")
        logger.info(f"Pincodes enriched: {pincode_count}")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Error during ingestion: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
