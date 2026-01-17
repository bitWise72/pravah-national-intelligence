from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any

from database import get_db
from models.risk_zones import RiskZone, RiskLevel
from schemas import RiskZoneResponse, RiskFactors, RiskLevelEnum
from services.privacy_enforcer import privacy_enforcer

router = APIRouter()

@router.get("/stats/national")
async def get_national_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    total_pop = db.query(func.sum(RiskZone.population)).scalar() or 0
    total_zones = db.query(func.count(RiskZone.id)).scalar() or 0
    
    critical = db.query(func.count(RiskZone.id)).filter(RiskZone.risk_level == 'critical').scalar() or 0
    high = db.query(func.count(RiskZone.id)).filter(RiskZone.risk_level == 'high').scalar() or 0
    medium = db.query(func.count(RiskZone.id)).filter(RiskZone.risk_level == 'medium').scalar() or 0
    low = db.query(func.count(RiskZone.id)).filter(RiskZone.risk_level == 'low').scalar() or 0

    avg_mig = db.query(func.avg(RiskZone.migration_velocity)).scalar() or 0
    avg_bio = db.query(func.avg(RiskZone.biometric_risk)).scalar() or 0
    avg_dig = db.query(func.avg(RiskZone.digital_exclusion)).scalar() or 0
    
    anomalies = db.query(func.count(RiskZone.id)).filter(RiskZone.anomaly_flag == True).scalar() or 0

    return {
        "total_population": total_pop,
        "calibrated_population": 1_410_000_000, 
        "total_zones": total_zones,
        "risk_counts": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        },
        "averages": {
            "migration": float(avg_mig),
            "biometric": float(avg_bio),
            "digital": float(avg_dig)
        },
        "anomalies": anomalies
    }

@router.get("/risk-zones", response_model=List[RiskZoneResponse])
async def get_risk_zones(
    risk_level: Optional[RiskLevelEnum] = Query(None, description="Filter by risk level"),
    state: Optional[str] = Query(None, description="Filter by state"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    query = db.query(RiskZone)

    if risk_level and risk_level != RiskLevelEnum.ALL:
        query = query.filter(RiskZone.risk_level == risk_level.value)

    if state:
        query = query.filter(RiskZone.state == state)

    query = query.filter(RiskZone.is_suppressed == False)

    query = query.order_by(RiskZone.risk_score.desc())

    risk_zones = query.limit(limit).all()

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

        if privacy_enforcer.should_suppress(zone.population):
            continue

        results.append(RiskZoneResponse(**response_data))

    return results

@router.get("/risk-zones/{pincode}", response_model=RiskZoneResponse)
async def get_risk_zone_by_pincode(
    pincode: str,
    db: Session = Depends(get_db)
):
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

    if privacy_enforcer.should_suppress(risk_zone.population):
        response_data.update({
            "population": None,
            "risk_score": None,
            "factors": None,
            "suppressed": True,
            "suppression_reason": f"Data suppressed for privacy (n<{privacy_enforcer.minimum_cell_size})"
        })

    return RiskZoneResponse(**response_data)
