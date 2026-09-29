from typing import List, Tuple, Optional
from models import BookingRequest, CandidateFacility, ScoredFacility, ScoreBreakdown

def calculate_capacity_score(capacity: int, student_count: int) -> float:
    """
    Capacity fit (35% weight):
    - Must fit attendees.
    - Highest score when capacity closely matches student_count.
    - Penalized progressively when oversized, especially > 2x student_count.
    """
    if capacity < student_count:
        return 0.0
    
    ratio = capacity / max(student_count, 1)
    if ratio == 1.0:
        raw_score = 100.0
    elif ratio <= 1.25:
        # Very close fit (e.g. 1.0 - 1.25x)
        raw_score = 100.0 - (ratio - 1.0) * 40.0  # 100 down to 90
    elif ratio <= 1.75:
        # Good fit (e.g. 1.25 - 1.75x)
        raw_score = 90.0 - (ratio - 1.25) * 40.0  # 90 down to 70
    elif ratio <= 2.0:
        # Acceptable fit (e.g. 1.75 - 2.0x)
        raw_score = 70.0 - (ratio - 1.75) * 60.0  # 70 down to 55
    else:
        # > 2x oversize penalized heavily
        oversize_ratio = ratio - 2.0
        raw_score = max(10.0, 55.0 - oversize_ratio * 15.0)
    
    return round(raw_score, 2)

def calculate_equipment_score(facility_equipment: List[str], required_equipment: List[str]) -> float:
    """
    Equipment match (30% weight):
    - Percentage of required equipment provided by the facility.
    """
    if not required_equipment:
        return 100.0
    
    fac_eq_lower = {eq.strip().lower() for eq in facility_equipment}
    req_eq_lower = {eq.strip().lower() for eq in required_equipment}
    
    matched = req_eq_lower.intersection(fac_eq_lower)
    raw_score = (len(matched) / len(req_eq_lower)) * 100.0
    return round(raw_score, 2)

def calculate_facility_type_score(facility_type: str, requested_type: str) -> float:
    """
    Facility type match (15% weight):
    - 100 if matching type, 0 otherwise.
    """
    if facility_type.strip().lower() == requested_type.strip().lower():
        return 100.0
    return 0.0

def calculate_utilization_score(candidate_bookings: int, max_bookings: int, min_bookings: int) -> float:
    """
    Historical utilization balancing (20% weight):
    - Prefer less-used facilities to balance wear and load across campus.
    """
    if max_bookings == min_bookings:
        return 85.0
    
    # Range normalization: 0 bookings -> 100 score, max bookings -> 50 score
    ratio = (candidate_bookings - min_bookings) / max(max_bookings - min_bookings, 1)
    raw_score = 100.0 - (ratio * 50.0)
    return round(raw_score, 2)

def generate_reason_and_tradeoff(
    facility: CandidateFacility,
    request: BookingRequest,
    is_primary: bool,
    capacity_raw: float,
    equipment_raw: float,
    utilization_raw: float,
    rank: int
) -> Tuple[str, Optional[str]]:
    """
    Generates factual template-driven reasons and trade-offs based strictly on calculated facts.
    Never hallucinates or invents non-existent details. Max 2 sentences.
    """
    student_count = request.student_count
    cap = facility.capacity
    eq_list = ", ".join(facility.equipment) if facility.equipment else "no specialized equipment"
    
    # Sentence 1: Capacity & Type alignment
    if cap == student_count:
        s1 = f"Exact capacity match with {cap} seats for {student_count} attendees in {facility.building}."
    elif cap <= student_count * 1.3:
        s1 = f"Optimal capacity fit with {cap} seats for {student_count} attendees in {facility.building}."
    elif cap <= student_count * 2.0:
        s1 = f"Comfortable capacity of {cap} seats accommodating {student_count} attendees in {facility.building}."
    else:
        oversize_multiple = round(cap / max(student_count, 1), 1)
        s1 = f"Larger venue with {cap} seats ({oversize_multiple}x requested size) in {facility.building}."

    # Sentence 2: Equipment & Utilization balance
    if is_primary:
        if equipment_raw == 100.0 and request.required_equipment:
            s2 = f"Equipped with all requested items ({eq_list}) while keeping campus utilization balanced."
        elif not request.required_equipment:
            s2 = f"Provides suitable environment on {facility.floor} with {facility.historical_booking_count} prior allocations."
        else:
            s2 = f"Partially matches requested equipment ({eq_list}) with balanced historical utilization."
        return f"{s1} {s2}".strip(), None
    else:
        # Alternative reason
        if equipment_raw == 100.0 and request.required_equipment:
            s2 = f"Fully supports required equipment ({eq_list}) and serves as an effective backup."
        else:
            s2 = f"Available on {facility.floor} with {facility.historical_booking_count} recorded bookings."
        
        # Tradeoff explanation
        tradeoffs = []
        if cap > student_count * 2.0:
            tradeoffs.append(f"{round(cap / max(student_count, 1), 1)}x oversize capacity (+{cap - student_count} extra seats)")
        elif cap > student_count * 1.4:
            tradeoffs.append(f"+{cap - student_count} surplus seats")
        
        if facility.historical_booking_count > 5:
            tradeoffs.append(f"higher prior utilization ({facility.historical_booking_count} bookings)")
            
        if not tradeoffs:
            tradeoffs.append(f"located on {facility.floor} of {facility.building}")
            
        trade_off_text = "Trade-off: " + "; ".join(tradeoffs) + "."
        return f"{s1} {s2}".strip(), trade_off_text

def score_and_rank_candidates(
    request: BookingRequest,
    candidates: List[CandidateFacility]
) -> Tuple[Optional[ScoredFacility], List[ScoredFacility]]:
    """
    Evaluates each candidate with the weighted formula:
    - Capacity Fit: 35%
    - Equipment Match: 30%
    - Facility Type Match: 15%
    - Utilization Balancing: 20%
    Returns (primary, alternatives[2-3]).
    """
    if not candidates:
        return None, []

    booking_counts = [c.historical_booking_count for c in candidates]
    max_b = max(booking_counts) if booking_counts else 0
    min_b = min(booking_counts) if booking_counts else 0

    scored_list = []
    for cand in candidates:
        cap_raw = calculate_capacity_score(cand.capacity, request.student_count)
        eq_raw = calculate_equipment_score(cand.equipment, request.required_equipment)
        type_raw = calculate_facility_type_score(cand.type, request.facility_type)
        util_raw = calculate_utilization_score(cand.historical_booking_count, max_b, min_b)

        # Weighted calculation
        total_score = (
            cap_raw * 0.35 +
            eq_raw * 0.30 +
            type_raw * 0.15 +
            util_raw * 0.20
        )
        total_score = round(max(0.0, min(100.0, total_score)), 1)

        breakdown = ScoreBreakdown(
            capacity_fit=round(cap_raw * 0.35, 1),
            equipment_match=round(eq_raw * 0.30, 1),
            facility_type_match=round(type_raw * 0.15, 1),
            utilization_balance=round(util_raw * 0.20, 1)
        )

        scored_list.append({
            "candidate": cand,
            "score": total_score,
            "breakdown": breakdown,
            "cap_raw": cap_raw,
            "eq_raw": eq_raw,
            "type_raw": type_raw,
            "util_raw": util_raw
        })

    # Sort descending by score; break ties with smallest positive capacity difference
    scored_list.sort(
        key=lambda item: (item["score"], -abs(item["candidate"].capacity - request.student_count)),
        reverse=True
    )

    # Convert to ScoredFacility objects
    results: List[ScoredFacility] = []
    for idx, item in enumerate(scored_list):
        is_primary = (idx == 0)
        cand = item["candidate"]
        reason, tradeoff = generate_reason_and_tradeoff(
            facility=cand,
            request=request,
            is_primary=is_primary,
            capacity_raw=item["cap_raw"],
            equipment_raw=item["eq_raw"],
            utilization_raw=item["util_raw"],
            rank=idx + 1
        )
        scored_facility = ScoredFacility(
            facility_id=cand.id,
            facility_name=cand.name,
            facility_type=cand.type,
            capacity=cand.capacity,
            building=cand.building,
            floor=cand.floor,
            equipment=cand.equipment,
            score=item["score"],
            breakdown=item["breakdown"],
            reason=reason,
            trade_off=tradeoff
        )
        results.append(scored_facility)

    primary = results[0] if results else None
    alternatives = results[1:4] if len(results) > 1 else []

    return primary, alternatives
