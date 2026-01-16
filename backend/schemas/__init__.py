"""Pydantic schemas for API request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class RiskLevelEnum(str, Enum):
    """Risk level enumeration."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    ALL = "all"


# Census API Schemas
class CalibratedCensusResponse(BaseModel):
    """Response schema for calibrated census data."""
    pincode: str
    census_baseline: Optional[int] = None
    aadhaar_proxy: Optional[int] = None
    calibrated_population: Optional[int] = None
    lower_ci: Optional[int] = None
    upper_ci: Optional[int] = None
    timestamp: datetime
    suppressed: bool = False
    suppression_reason: Optional[str] = None


# Migration API Schemas
class MigrationResponse(BaseModel):
    """Response schema for migration data."""
    pincode: str
    date: date
    velocity: Optional[float] = None
    net_change: Optional[int] = None
    direction: Optional[str] = None
    suppressed: bool = False
    suppression_reason: Optional[str] = None


# Biometric Risk Schemas
class BiometricRiskResponse(BaseModel):
    """Response schema for biometric risk data."""
    pincode: str
    district: str
    enrolled_children: Optional[int] = None
    expected_children: Optional[int] = None
    survival_score: Optional[float] = None
    deficit: Optional[int] = None
    suppressed: bool = False
    suppression_reason: Optional[str] = None


# Digital Exclusion Schemas
class DigitalExclusionResponse(BaseModel):
    """Response schema for digital exclusion data."""
    pincode: str
    district: str
    darkness_index: Optional[float] = None
    otp_failure_rate: Optional[float] = None
    internet_penetration: Optional[float] = None
    suppressed: bool = False
    suppression_reason: Optional[str] = None


# Risk Zone Schemas
class RiskFactors(BaseModel):
    """Risk factor breakdown."""
    migration: Optional[float] = None
    biometric: Optional[float] = None
    digital: Optional[float] = None


class RiskZoneResponse(BaseModel):
    """Response schema for risk zone data."""
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


# Anomaly Schemas
class AnomalyResponse(BaseModel):
    """Response schema for anomaly detection."""
    pincode: str
    anomaly_flag: bool
    anomaly_score: Optional[float] = None
    detected_at: Optional[datetime] = None
    type: Optional[str] = None
    suppressed: bool = False
    suppression_reason: Optional[str] = None


# Search Schemas
class SearchResult(BaseModel):
    """Search result item."""
    pincode: str
    district: str
    state: str
    match_score: float = Field(ge=0.0, le=1.0)


class SearchResponse(BaseModel):
    """Response schema for search results."""
    query: str
    results: List[SearchResult]
    total: int
