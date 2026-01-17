from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models.risk_zones import RiskZone
from schemas import AnomalyResponse

router = APIRouter()

@router.get("/anomalies", response_model=List[AnomalyResponse])
async def get_anomalies(
    limit: int = Query(50, ge=1, le=200, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    anomalies = db.query(RiskZone).filter(
        RiskZone.anomaly_flag == True,
        RiskZone.is_suppressed == False
    ).order_by(RiskZone.anomaly_score.desc()).limit(limit).all()

    results = []
    for zone in anomalies:
        results.append(AnomalyResponse(
            pincode=zone.pincode,
            anomaly_flag=zone.anomaly_flag,
            anomaly_score=zone.anomaly_score,
            detected_at=zone.updated_at or datetime.utcnow(),
            type="migration_spike" if zone.migration_velocity > 0.08 else "biometric_deficit",
            suppressed=zone.is_suppressed,
            suppression_reason=zone.suppression_reason
        ))

    return results

@router.get("/anomalies/{pincode}", response_model=AnomalyResponse)
async def get_anomaly_by_pincode(
    pincode: str,
    db: Session = Depends(get_db)
):
    risk_zone = db.query(RiskZone).filter(RiskZone.pincode == pincode).first()

    if not risk_zone:
        raise HTTPException(status_code=404, detail=f"Pincode {pincode} not found")

    return AnomalyResponse(
        pincode=risk_zone.pincode,
        anomaly_flag=risk_zone.anomaly_flag,
        anomaly_score=risk_zone.anomaly_score,
        detected_at=risk_zone.updated_at or datetime.utcnow(),
        type="migration_spike" if risk_zone.migration_velocity > 0.08 else "biometric_deficit",
        suppressed=risk_zone.is_suppressed,
        suppression_reason=risk_zone.suppression_reason
    )
