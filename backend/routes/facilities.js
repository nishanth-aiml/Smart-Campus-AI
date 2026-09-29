const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/facilities - List all facilities with equipment and status
router.get('/', async (req, res, next) => {
  try {
    const facilities = await db.getAllFacilities();
    res.json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
