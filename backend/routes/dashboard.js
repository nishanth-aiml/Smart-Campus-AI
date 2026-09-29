const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
  try {
    const facilities = await db.getAllFacilities();
    const allocations = await db.getAllAllocations();

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // Filter confirmed allocations for today
    const todaysAllocations = allocations.filter(a => {
      if (a.status !== 'confirmed') return false;
      const startDay = new Date(a.start_datetime).toISOString().slice(0, 10);
      return startDay === todayStr;
    });

    // Facility availability grid for the current moment
    const currentTimestamp = now.getTime();
    const facilityGrid = facilities.map(fac => {
      // Find active allocation right now or later today
      const activeNow = todaysAllocations.find(a => {
        if (a.facility_id !== fac.id) return false;
        const s = new Date(a.start_datetime).getTime();
        const e = new Date(a.end_datetime).getTime();
        return currentTimestamp >= s && currentTimestamp <= e;
      });

      const upcomingToday = todaysAllocations.find(a => {
        if (a.facility_id !== fac.id) return false;
        const s = new Date(a.start_datetime).getTime();
        return s > currentTimestamp;
      });

      let status = 'Free';
      let currentEvent = null;

      if (activeNow) {
        status = 'Occupied';
        currentEvent = {
          name: activeNow.event_name || 'Active Session',
          end: activeNow.end_datetime
        };
      } else if (upcomingToday) {
        status = 'Reserved';
        currentEvent = {
          name: upcomingToday.event_name || 'Upcoming Event',
          start: upcomingToday.start_datetime
        };
      }

      return {
        id: fac.id,
        name: fac.name,
        type: fac.type,
        capacity: fac.capacity,
        building: fac.building,
        floor: fac.floor,
        equipment: fac.equipment,
        status,
        currentEvent
      };
    });

    const activeAllocationsCount = todaysAllocations.length;
    // Utilization %: venues with at least one booking today vs total venues
    const uniqueBookedVenuesToday = new Set(todaysAllocations.map(a => a.facility_id)).size;
    const utilizationRate = facilities.length > 0
      ? Math.round((uniqueBookedVenuesToday / facilities.length) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        totalFacilities: facilities.length,
        activeAllocationsToday: activeAllocationsCount,
        utilizationRate: utilizationRate,
        pendingRequests: 0
      },
      todaysAllocations: todaysAllocations.slice(0, 10),
      facilityGrid
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
