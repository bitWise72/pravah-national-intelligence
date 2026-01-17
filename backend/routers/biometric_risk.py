from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.biometric import BiometricData
from models.risk_zones import RiskZone
from schemas import BiometricRiskResponse
from services.privacy_enforcer import privacy_enforcer

router = APIRouter()

@router.get("/biometric-risk", response_model=BiometricRiskResponse)
async def get_biometric_risk(
    pincode: str = Query(..., description="6-digit pincode"),
    db: Session = Depends(get_db)
):
    risk_zone = db.query(RiskZone).filter(RiskZone.pincode == pincode).first()

    if not risk_zone:
        raise HTTPException(status_code=404, detail=f"Pincode {pincode} not found")

    bio_data = db.query(BiometricData).filter(
        BiometricData.pincode == pincode
    ).order_by(BiometricData.date.desc()).first()

    if not bio_data:
        raise HTTPException(status_code=404, detail=f"No biometric data found for pincode {pincode}")

    enrolled_children = bio_data.bio_age_0_5 + bio_data.bio_age_5_17
    expected_children = int(enrolled_children * 1.15)
    survival_score = 0.85 if enrolled_children > 0 else 0.0
    deficit = max(0, expected_children - enrolled_children)

    response_data = {
        "pincode": pincode,
        "district": risk_zone.district,
        "enrolled_children": enrolled_children,
        "expected_children": expected_children,
        "survival_score": survival_score,
        "deficit": deficit,
        "suppressed": False
    }

    if privacy_enforcer.should_suppress(enrolled_children):
        response_data.update({
            "enrolled_children": None,
            "expected_children": None,
            "survival_score": None,
            "deficit": None,
            "suppressed": True,
            "suppression_reason": f"Data suppressed for privacy (n<{privacy_enforcer.minimum_cell_size})"
        })

    return BiometricRiskResponse(**response_data)
