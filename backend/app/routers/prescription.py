"""
POST /api/prescription — Generate a music prescription.

Receives user's emotion text and recent song IDs, returns a prescription
with a recommended Eason Chan song and personalized advice.
"""

from fastapi import APIRouter, HTTPException
from app.models import PrescriptionRequest, PrescriptionResponse
from app.recommender import recommender
from app.prescription_writer import prescription_writer

router = APIRouter(prefix="/api", tags=["prescription"])


@router.post("/prescription", response_model=PrescriptionResponse)
async def create_prescription(request: PrescriptionRequest):
    try:
        # Get recommendation
        result = recommender.get_recommendation(
            text=request.text,
            recent_song_ids=request.recent_song_ids,
        )

        # Write the prescription
        prescription = prescription_writer.write_prescription(
            song=result["song"],
            symptoms=result["symptoms"],
        )

        return PrescriptionResponse(**prescription)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"陈医生暂时无法听诊：{str(e)}")
