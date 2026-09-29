import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from main import app
from models import BookingRequest, CandidateFacility
from scoring import score_and_rank_candidates, calculate_capacity_score

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "smart-campus-ai-engine"

def test_empty_candidates():
    req = BookingRequest(
        event_name="Small Sync",
        event_type="Meeting",
        student_count=20,
        start_datetime="2026-10-01T10:00:00",
        end_datetime="2026-10-01T11:00:00",
        facility_type="Classroom",
        required_equipment=["Projector"]
    )
    primary, alternatives = score_and_rank_candidates(req, [])
    assert primary is None
    assert alternatives == []

    # API test for empty candidates
    api_response = client.post("/suggest", json={
        "request": req.model_dump(),
        "candidates": []
    })
    assert api_response.status_code == 200
    json_data = api_response.json()
    assert json_data["primary"] is None
    assert json_data["alternatives"] == []

def test_ranking_order_capacity_and_equipment():
    req = BookingRequest(
        event_name="AI Workshop",
        event_type="Workshop",
        student_count=40,
        start_datetime="2026-10-01T10:00:00",
        end_datetime="2026-10-01T13:00:00",
        facility_type="Lab",
        required_equipment=["Computers", "Projector", "AC"]
    )

    # Candidate 1: Ideal capacity (45), 100% equipment, low bookings
    cand1 = CandidateFacility(
        id=3,
        name="Turing AI Lab",
        type="Lab",
        capacity=45,
        building="Tech Center",
        floor="Ground Floor",
        equipment=["Computers", "Projector", "AC", "Whiteboard"],
        historical_booking_count=2
    )

    # Candidate 2: Heavily oversized (500 capacity for 40 students), missing computers
    cand2 = CandidateFacility(
        id=6,
        name="Main Auditorium",
        type="Auditorium",
        capacity=500,
        building="Auditorium Block",
        floor="Ground Floor",
        equipment=["Projector", "Mic", "AC", "Live Stream"],
        historical_booking_count=8
    )

    # Candidate 3: Slightly oversized (80 capacity), matching type & equipment
    cand3 = CandidateFacility(
        id=8,
        name="Visvesvaraya Seminar Hall",
        type="Lab",
        capacity=80,
        building="Core Block",
        floor="3rd Floor",
        equipment=["Computers", "Projector", "AC"],
        historical_booking_count=3
    )

    primary, alternatives = score_and_rank_candidates(req, [cand1, cand2, cand3])

    assert primary is not None
    assert primary.facility_id == 3  # Ideal fit should be primary
    assert primary.score > alternatives[1].score  # Ideal fit scores much higher than heavily oversized candidate
    assert primary.trade_off is None  # Primary has no trade_off
    assert len(alternatives) == 2
    assert alternatives[0].facility_id == 8  # Next closest
    assert alternatives[1].facility_id == 6  # Heavily penalized candidate
    assert alternatives[0].trade_off is not None

def test_oversize_penalty():
    # 30 students in 35 capacity vs 30 students in 300 capacity
    score_tight = calculate_capacity_score(capacity=35, student_count=30)
    score_oversized = calculate_capacity_score(capacity=300, student_count=30)
    assert score_tight > 90.0
    assert score_oversized < 50.0

def test_template_reason_factual():
    req = BookingRequest(
        event_name="Physics Demo",
        event_type="Lecture",
        student_count=30,
        start_datetime="2026-10-01T14:00:00",
        end_datetime="2026-10-01T16:00:00",
        facility_type="Lab",
        required_equipment=["Projector"]
    )
    cand = CandidateFacility(
        id=5,
        name="Sir C.V. Raman Physics Lab",
        type="Lab",
        capacity=35,
        building="Science Complex",
        floor="Ground Floor",
        equipment=["Projector", "AC", "Whiteboard"],
        historical_booking_count=1
    )
    primary, _ = score_and_rank_candidates(req, [cand])
    assert primary is not None
    # Verify no hallucinated text and max 2 sentences
    sentences = [s for s in primary.reason.split(".") if s.strip()]
    assert len(sentences) <= 2
    assert "Science Complex" in primary.reason
    assert "35 seats" in primary.reason
