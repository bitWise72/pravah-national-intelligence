import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SQLITE_URL = "sqlite:///./pravah.db"
NEON_URL = os.environ.get("DATABASE_URL", "").replace("?sslmode=require", "?sslmode=require")

from models import Base
from models.pincode_metadata import PincodeMetadata
from models.biometric import BiometricData
from models.demographic import DemographicData
from models.enrolment import EnrolmentData
from models.risk_zones import RiskZone

def migrate_sqlite_to_neon():
    if not NEON_URL or "sqlite" in NEON_URL:
        logger.error("NEON_URL not set or is SQLite. Set DATABASE_URL env var to Neon PostgreSQL URL.")
        return False
    
    logger.info("Connecting to SQLite...")
    sqlite_engine = create_engine(SQLITE_URL, echo=False)
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SqliteSession()
    
    logger.info("Connecting to Neon PostgreSQL...")
    neon_engine = create_engine(NEON_URL, echo=False)
    NeonSession = sessionmaker(bind=neon_engine)
    neon_session = NeonSession()
    
    logger.info("Creating tables in Neon...")
    Base.metadata.create_all(neon_engine)
    
    models_to_migrate = [
        ("PincodeMetadata", PincodeMetadata),
        ("BiometricData", BiometricData),
        ("DemographicData", DemographicData),
        ("EnrolmentData", EnrolmentData),
        ("RiskZone", RiskZone),
    ]
    
    for model_name, model_class in models_to_migrate:
        logger.info(f"Migrating {model_name}...")
        
        records = sqlite_session.query(model_class).all()
        logger.info(f"  Found {len(records)} records")
        
        if records:
            neon_session.query(model_class).delete()
            neon_session.commit()
            
            for record in records:
                neon_session.merge(record)
            
            neon_session.commit()
            logger.info(f"  Migrated {len(records)} {model_name} records")
    
    sqlite_session.close()
    neon_session.close()
    
    logger.info("Migration complete!")
    return True

if __name__ == "__main__":
    success = migrate_sqlite_to_neon()
    sys.exit(0 if success else 1)
