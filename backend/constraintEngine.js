const db = require('./db');

/**
 * Validates schedule constraints:
 * - start_datetime and end_datetime must be valid ISO / datetime strings
 * - end_datetime > start_datetime
 * - within campus operating hours (08:00 to 20:00)
 */
function validateSchedule(startDatetime, endDatetime) {
  const start = new Date(startDatetime);
  const end = new Date(endDatetime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, reason: 'Invalid date/time format' };
  }

  if (end <= start) {
    return { valid: false, reason: 'End time must be after start time' };
  }

  const startHour = start.getHours() + start.getMinutes() / 60;
  const endHour = end.getHours() + end.getMinutes() / 60;

  if (startHour < 8 || endHour > 20) {
    return { valid: false, reason: 'Event must be scheduled between campus operating hours (08:00 to 20:00)' };
  }

  return { valid: true };
}

/**
 * Runs the strict multi-stage SQL constraint pipeline:
 * 1. Capacity >= student_count
 * 2. Facility Type match
 * 3. Required equipment is a subset of facility equipment
 * 4. No overlapping confirmed allocation
 * 5. Schedule validity (08:00-20:00, end > start)
 */
async function evaluateConstraints(requestData) {
  const {
    student_count,
    facility_type,
    required_equipment = [],
    start_datetime,
    end_datetime
  } = requestData;

  // 1. Validate schedule
  const scheduleCheck = validateSchedule(start_datetime, end_datetime);
  if (!scheduleCheck.valid) {
    return {
      success: false,
      schedule_valid: false,
      error_reason: scheduleCheck.reason,
      candidates: [],
      audit: {
        schedule_valid: false,
        capacity_checked: 0,
        type_matched: 0,
        equipment_matched: 0,
        conflict_free: 0
      }
    };
  }

  // Fetch all facilities and historical bookings count
  const allFacilities = await db.getAllFacilities();
  const bookingCountMap = await db.getFacilityBookingsCount();

  const audit = {
    schedule_valid: true,
    total_facilities_evaluated: allFacilities.length,
    passed_capacity: 0,
    passed_type: 0,
    passed_equipment: 0,
    passed_availability: 0,
    per_facility_status: []
  };

  const candidateFacilities = [];
  const reqEqSet = new Set(required_equipment.map(e => e.trim().toLowerCase()));

  for (const fac of allFacilities) {
    const facEqSet = new Set((fac.equipment || []).map(e => e.trim().toLowerCase()));

    // Rule 1: Capacity fit
    const capacityPass = fac.capacity >= student_count;
    if (capacityPass) audit.passed_capacity++;

    // Rule 2: Facility type match
    const typePass = fac.type.toLowerCase() === facility_type.toLowerCase();
    if (typePass) audit.passed_type++;

    // Rule 3: Equipment subset match
    let equipmentPass = true;
    for (const reqEq of reqEqSet) {
      if (!facEqSet.has(reqEq)) {
        equipmentPass = false;
        break;
      }
    }
    if (equipmentPass) audit.passed_equipment++;

    // Rule 4: Availability / Overlap check
    const hasOverlap = await db.checkOverlap(fac.id, start_datetime, end_datetime);
    const availabilityPass = !hasOverlap;
    if (availabilityPass) audit.passed_availability++;

    const isCandidate = capacityPass && typePass && equipmentPass && availabilityPass;

    audit.per_facility_status.push({
      facility_id: fac.id,
      name: fac.name,
      capacity: fac.capacity,
      type: fac.type,
      passed: isCandidate,
      checks: {
        capacity: capacityPass,
        facility_type: typePass,
        equipment: equipmentPass,
        availability: availabilityPass
      }
    });

    if (isCandidate) {
      candidateFacilities.push({
        id: fac.id,
        name: fac.name,
        type: fac.type,
        capacity: fac.capacity,
        building: fac.building,
        floor: fac.floor,
        equipment: fac.equipment || [],
        historical_booking_count: bookingCountMap[fac.id] || 0
      });
    }
  }

  return {
    success: true,
    schedule_valid: true,
    candidates: candidateFacilities,
    audit
  };
}

module.exports = {
  validateSchedule,
  evaluateConstraints
};
