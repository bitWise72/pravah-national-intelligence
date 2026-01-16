"""
Risk Zones API Router
Provides high-risk zones with composite risk scores.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models.risk_zones import RiskZone, RiskLevel
from schemas import RiskZoneResponse, RiskFactors, RiskLevelEnum
from services.privacy_enforcer import privacy_enforcer

router = APIRouter()


@router.get("/risk-zones", response_model=List[RiskZoneResponse])
async def get_risk_zones(
    risk_level: Optional[RiskLevelEnum] = Query(None, description="Filter by risk level"),
    state: Optional[str] = Query(None, description="Filter by state"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    """
    Get list of risk zones with composite risk scores.
    
    Returns zones filtered by risk level and/or state, with privacy enforcement.
    Suppressed zones are excluded from results.
    """
    query = db.query(RiskZone)
    
    # Apply filters
    if risk_level and risk_level != RiskLevelEnum.ALL:
        query = query.filter(RiskZone.risk_level == risk_level.value)
    
    if state:
        query = query.filter(RiskZone.state == state)
    
    # Exclude suppressed zones
    query = query.filter(RiskZone.is_suppressed == False)
    
    # Order by risk score descending
    query = query.order_by(RiskZone.risk_score.desc())
    
    # Limit results
    risk_zones = query.limit(limit).all()
    
    # Build response
    results = []
    for zone in risk_zones:
        response_data = {
            "pincode": zone.pincode,
            "district": zone.district,
            "state": zone.state,
            "latitude": zone.latitude,
            "longitude": zone.longitude,
            "population": zone.population,
            "risk_score": zone.risk_score,
            "risk_level": zone.risk_level,
            "factors": RiskFactors(
                migration=zone.migration_velocity,
                biometric=zone.biometric_risk,
                digital=zone.digital_exclusion
            ),
            "anomaly_flag": zone.anomaly_flag,
            "suppressed": zone.is_suppressed,
            "suppression_reason": zone.suppression_reason
        }
        
        # Additional privacy check
        if privacy_enforcer.should_suppress(zone.population):
            continue  # Skip this zone
        
        results.append(RiskZoneResponse(**response_data))
    
    return results


@router.get("/risk-zones/{pincode}", response_model=RiskZoneResponse)
async def get_risk_zone_by_pincode(
    pincode: str,
    db: Session = Depends(get_db)
):
    """Get risk zone data for a specific pincode."""
    risk_zone = db.query(RiskZone).filter(RiskZone.pincode == pincode).first()
    
    if not risk_zone:
        raise HTTPException(status_code=404, detail=f"Pincode {pincode} not found")
    
    response_data = {
        "pincode": risk_zone.pincode,
        "district": risk_zone.district,
        "state": risk_zone.state,
        "latitude": risk_zone.latitude,
        "longitude": risk_zone.longitude,
        "population": risk_zone.population,
        "risk_score": risk_zone.risk_score,
        "risk_level": risk_zone.risk_level,
        "factors": RiskFactors(
            migration=risk_zone.migration_velocity,
            biometric=risk_zone.biometric_risk,
            digital=risk_zone.digital_exclusion
        ),
        "anomaly_flag": risk_zone.anomaly_flag,
        "suppressed": risk_zone.is_suppressed,
        "suppression_reason": risk_zone.suppression_reason
    }
    
    # Apply privacy enforcement
    if privacy_enforcer.should_suppress(risk_zone.population):
        response_data.update({
            "population": None,
            "risk_score": None,
            "factors": None,
            "suppressed": True,
            "suppression_reason": f"Data suppressed for privacy (n<{privacy_enforcer.minimum_cell_size})"
        })
    
    return RiskZoneResponse(**response_data)
