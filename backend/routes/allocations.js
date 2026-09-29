const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/allocations
router.get('/', async (req, res, next) => {
  try {
    const allocations = await db.getAllAllocations();
    res.json({
      success: true,
      count: allocations.length,
      data: allocations
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/allocations - Create confirmed allocation with conflict checking
router.post('/', async (req, res, next) => {
  try {
    const { request_id, facility_id, start_datetime, end_datetime } = req.body;

    if (!facility_id || !start_datetime || !end_datetime) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'facility_id, start_datetime, and end_datetime are required.'
      });
    }

    const facilityIdNum = parseInt(facility_id, 10);
    const requestIdNum = request_id ? parseInt(request_id, 10) : null;

    // Transactional allocation with double conflict check
    const result = await db.createAllocationWithLock({
      requestId: requestIdNum,
      facilityId: facilityIdNum,
      startDatetime: start_datetime,
      endDatetime: end_datetime
    });

    if (result.conflict) {
      return res.status(409).json({
        error: 'Slot Conflict',
        message: 'The selected facility was just reserved by another request during this exact time slot. Please choose an alternative facility option.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Facility allocated and confirmed successfully.',
      data: result.allocation
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
