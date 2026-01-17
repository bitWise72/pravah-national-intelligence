from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from database import get_db
from models.risk_zones import RiskZone
from schemas import CalibratedCensusResponse
from services.privacy_enforcer import privacy_enforcer

router = APIRouter()

@router.get("/census/calibrated", response_model=CalibratedCensusResponse)
async def get_calibrated_census(
    pincode: str = Query(..., description="6-digit pincode"),
    db: Session = Depends(get_db)
):
    risk_zone = db.query(RiskZone).filter(RiskZone.pincode == pincode).first()

    if not risk_zone:
        raise HTTPException(status_code=404, detail=f"Pincode {pincode} not found")

    response_data = {
        "pincode": risk_zone.pincode,
        "census_baseline": risk_zone.population,
        "aadhaar_proxy": risk_zone.population,
        "calibrated_population": risk_zone.calibrated_population,
        "lower_ci": risk_zone.lower_ci,
        "upper_ci": risk_zone.upper_ci,
        "timestamp": datetime.utcnow(),
        "suppressed": risk_zone.is_suppressed,
        "suppression_reason": risk_zone.suppression_reason
    }

    if privacy_enforcer.should_suppress(risk_zone.population):
        response_data.update({
            "census_baseline": None,
            "aadhaar_proxy": None,
            "calibrated_population": None,
            "lower_ci": None,
            "upper_ci": None,
            "suppressed": True,
            "suppression_reason": f"Data suppressed for privacy (n<{privacy_enforcer.minimum_cell_size})"
        })

    return CalibratedCensusResponse(**response_data)
