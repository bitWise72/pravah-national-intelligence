from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List

from database import get_db
from models.pincode_metadata import PincodeMetadata
from models.risk_zones import RiskZone
from schemas import SearchResponse, SearchResult

router = APIRouter()

@router.get("/search", response_model=SearchResponse)
async def search_locations(
    query: str = Query(..., min_length=2, description="Search query (pincode, district, or state)"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    search_term = f"%{query}%"

    results = db.query(
        PincodeMetadata.pincode,
        PincodeMetadata.district,
        PincodeMetadata.state
    ).filter(
        or_(
            PincodeMetadata.pincode.like(search_term),
            PincodeMetadata.district.ilike(search_term),
            PincodeMetadata.state.ilike(search_term),
            PincodeMetadata.post_office_name.ilike(search_term)
        )
    ).limit(limit).all()

    search_results = []
    for result in results:
        score = 1.0 if query.lower() in result.pincode.lower() else 0.7
        if query.lower() in result.district.lower():
            score = max(score, 0.8)
        if query.lower() in result.state.lower():
            score = max(score, 0.6)

        search_results.append(SearchResult(
            pincode=result.pincode,
            district=result.district,
            state=result.state,
            match_score=score
        ))

    search_results.sort(key=lambda x: x.match_score, reverse=True)

    return SearchResponse(
        query=query,
        results=search_results,
        total=len(search_results)
    )
