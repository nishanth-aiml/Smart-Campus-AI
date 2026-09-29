from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class BookingRequest(BaseModel):
    id: Optional[int] = None
    event_name: str
    event_type: str
    student_count: int = Field(gt=0, description="Number of students/attendees")
    start_datetime: str
    end_datetime: str
    facility_type: str
    required_equipment: List[str] = Field(default_factory=list)

class CandidateFacility(BaseModel):
    id: int
    name: str
    type: str
    capacity: int
    building: str
    floor: str
    equipment: List[str] = Field(default_factory=list)
    historical_booking_count: int = 0

class ScoreBreakdown(BaseModel):
    capacity_fit: float
    equipment_match: float
    facility_type_match: float
    utilization_balance: float

class ScoredFacility(BaseModel):
    facility_id: int
    facility_name: str
    facility_type: str
    capacity: int
    building: str
    floor: str
    equipment: List[str]
    score: float
    breakdown: ScoreBreakdown
    reason: str
    trade_off: Optional[str] = None

class SuggestionRequest(BaseModel):
    request: BookingRequest
    candidates: List[CandidateFacility] = Field(default_factory=list)

class SuggestionResponse(BaseModel):
    primary: Optional[ScoredFacility] = None
    alternatives: List[ScoredFacility] = Field(default_factory=list)
    fallback: bool = False
