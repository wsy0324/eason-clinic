"""
Pydantic models for the Eason Music Clinic API.
"""

from pydantic import BaseModel, Field
from typing import Optional


class PrescriptionRequest(BaseModel):
    """Request body for POST /api/prescription"""
    text: str = Field(..., min_length=1, max_length=500, description="User's emotion/symptom description")
    recent_song_ids: list[str] = Field(default_factory=list, max_length=3, description="IDs of recently prescribed songs to avoid")


class SongInfo(BaseModel):
    """Song info returned in the prescription (no icon — removed)"""
    id: str
    title: str
    moods: list[str]
    theme_color: str


class PrescriptionResponse(BaseModel):
    """Response body for POST /api/prescription — expanded version"""
    rx_id: str
    clinic: str
    symptom_summary: list[str]
    emotion_analysis: str
    song: SongInfo
    song_reason: str
    dosage: str
    listening_scene: str
    doctor_advice: str
    daily_task: str
    avoid: str
    follow_up: str
    small_note: str
