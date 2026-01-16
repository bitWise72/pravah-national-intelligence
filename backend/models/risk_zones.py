"""
Risk Zone Model
Stores computed risk scores and aggregated metrics for pincodes.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Index, Enum
from sqlalchemy.sql import func
import enum
from database import Base


class RiskLevel(str, enum.Enum):
    """Risk level enumeration."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RiskZone(Base):
    """Computed risk zones with aggregated metrics."""
    
    __tablename__ = "risk_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    pincode = Column(String(10), unique=True, nullable=False, index=True)
    
    # Location
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Population metrics
    population = Column(Integer, default=0)
    calibrated_population = Column(Integer, default=0)
    lower_ci = Column(Integer, default=0)
    upper_ci = Column(Integer, default=0)
    
    # Risk metrics (normalized 0-1)
    risk_score = Column(Float, default=0.0, index=True)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW, index=True)
    migration_velocity = Column(Float, default=0.0)
    biometric_risk = Column(Float, default=0.0)
    digital_exclusion = Column(Float, default=0.0)
    
    # Anomaly detection
    anomaly_flag = Column(Boolean, default=False, index=True)
    anomaly_score = Column(Float)
    
    # Privacy enforcement
    is_suppressed = Column(Boolean, default=False)
    suppression_reason = Column(String(200))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_risk_level_score', 'risk_level', 'risk_score'),
        Index('idx_risk_location', 'state', 'district'),
    )
    
    def __repr__(self):
        return f"<RiskZone(pincode={self.pincode}, risk_level={self.risk_level}, score={self.risk_score:.2f})>"
