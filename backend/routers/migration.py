from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
from typing import Optional

from database import get_db
from models.biometric import BiometricData
from models.demographic import DemographicData
from schemas import MigrationResponse
from services.privacy_enforcer import privacy_enforcer

router = APIRouter()

@router.get("/migration", response_model=MigrationResponse)
async def get_migration_data(
    pincode: Optional[str] = Query(None, description="6-digit pincode"),
    date_param: Optional[date] = Query(None, alias="date", description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    if not pincode:
        raise HTTPException(status_code=400, detail="Pincode is required")

    target_date = date_param or datetime.utcnow().date()

    bio_data = db.query(BiometricData).filter(
        BiometricData.pincode == pincode,
        BiometricData.date == target_date
    ).first()

    demo_data = db.query(DemographicData).filter(
        DemographicData.pincode == pincode,
        DemographicData.date == target_date
    ).first()

    if not bio_data and not demo_data:
        raise HTTPException(status_code=404, detail=f"No data found for pincode {pincode} on {target_date}")

    total_bio = bio_data.total_biometric if bio_data else 0
    total_demo = demo_data.total_demographic if demo_data else 0
    total_population = max(total_bio, total_demo)

    velocity = 0.05 if total_population > 0 else 0.0
    net_change = abs(total_bio - total_demo)
    direction = "inflow" if total_bio > total_demo else "outflow"

    response_data = {
        "pincode": pincode,
        "date": target_date,
        "velocity": velocity,
        "net_change": net_change,
        "direction": direction,
        "suppressed": False
    }

    if privacy_enforcer.should_suppress(total_population):
        response_data.update({
            "velocity": None,
            "net_change": None,
            "direction": None,
            "suppressed": True,
            "suppression_reason": f"Data suppressed for privacy (n<{privacy_enforcer.minimum_cell_size})"
        })

    return MigrationResponse(**response_data)
