"""Database models package."""
from database import Base

# Import all models here for Alembic migrations
from models.biometric import BiometricData
from models.demographic import DemographicData
from models.enrolment import EnrolmentData
from models.risk_zones import RiskZone
from models.pincode_metadata import PincodeMetadata

__all__ = [
    "Base",
    "BiometricData",
    "DemographicData",
    "EnrolmentData",
    "RiskZone",
    "PincodeMetadata",
]
