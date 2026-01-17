from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class RiskLevelEnum(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    ALL = "all"

class CalibratedCensusResponse(BaseModel):
    pincode: str
    census_baseline: Optional[int] = None
    aadhaar_proxy: Optional[int] = None
    calibrated_population: Optional[int] = None
    lower_ci: Optional[int] = None
    upper_ci: Optional[int] = None
    timestamp: datetime
    suppressed: bool = False
    suppression_reason: Optional[str] = None

class MigrationResponse(BaseModel):
    pincode: str
    date: date
    velocity: Optional[float] = None
    net_change: Optional[int] = None
    direction: Optional[str] = None
    suppressed: bool = False
    suppression_reason: Optional[str] = None

class BiometricRiskResponse(BaseModel):
    pincode: str
    district: str
    enrolled_children: Optional[int] = None
    expected_children: Optional[int] = None
    survival_score: Optional[float] = None
    deficit: Optional[int] = None
    suppressed: bool = False
    suppression_reason: Optional[str] = None

class DigitalExclusionResponse(BaseModel):
    pincode: str
    district: str
    darkness_index: Optional[float] = None
    otp_failure_rate: Optional[float] = None
    internet_penetration: Optional[float] = None
    suppressed: bool = False
    suppression_reason: Optional[str] = None

class RiskFactors(BaseModel):
    migration: Optional[float] = None
    biometric: Optional[float] = None
    digital: Optional[float] = None

class RiskZoneResponse(BaseModel):
    pincode: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population: Optional[int] = None
    risk_score: Optional[float] = None
    risk_level: Optional[RiskLevelEnum] = None
    factors: Optional[RiskFactors] = None
    anomaly_flag: bool = False
    suppressed: bool = False
    suppression_reason: Optional[str] = None

class AnomalyResponse(BaseModel):
    pincode: str
    anomaly_flag: bool
    anomaly_score: Optional[float] = None
    detected_at: Optional[datetime] = None
    type: Optional[str] = None
    suppressed: bool = False
    suppression_reason: Optional[str] = None

class SearchResult(BaseModel):
    pincode: str
    district: str
    state: str
    match_score: float = Field(ge=0.0, le=1.0)

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int
