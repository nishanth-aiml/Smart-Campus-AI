const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to filter allocations by date range if provided
function filterByRange(allocations, days = 30) {
  const now = new Date();
  const pastThreshold = new Date(now);
  pastThreshold.setDate(pastThreshold.getDate() - days);

  return allocations.filter(a => {
    if (a.status !== 'confirmed') return false;
    const d = new Date(a.start_datetime);
    return d >= pastThreshold;
  });
}

// 1. GET /api/analytics/utilization-by-hour
router.get('/utilization-by-hour', async (req, res, next) => {
  try {
    const allocations = await db.getAllAllocations();
    const days = parseInt(req.query.days || '30', 10);
    const filtered = filterByRange(allocations, days);

    // Hours from 08:00 to 20:00
    const hourMap = {};
    for (let h = 8; h <= 20; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      hourMap[label] = { hour: label, bookings: 0, utilizationRate: 0 };
    }

    for (const alloc of filtered) {
      const s = new Date(alloc.start_datetime);
      const e = new Date(alloc.end_datetime);
      const startHour = Math.max(8, s.getHours());
      const endHour = Math.min(20, e.getHours());

      for (let h = startHour; h <= endHour; h++) {
        const label = `${h.toString().padStart(2, '0')}:00`;
        if (hourMap[label]) {
          hourMap[label].bookings++;
        }
      }
    }

    const facilities = await db.getAllFacilities();
    const totalCap = Math.max(facilities.length * Math.max(1, days / 7), 1);

    const result = Object.values(hourMap).map(item => ({
      ...item,
      utilizationRate: Math.min(100, Math.round((item.bookings / totalCap) * 100))
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/analytics/weekly-bookings
router.get('/weekly-bookings', async (req, res, next) => {
  try {
    const allocations = await db.getAllAllocations();
    const days = parseInt(req.query.days || '7', 10);

    // Group bookings by day for the requested interval
    const dayMap = {};
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dayMap[key] = { date: key, label, bookings: 0, attendees: 0 };
    }

    for (const alloc of allocations) {
      if (alloc.status !== 'confirmed') return;
      const key = new Date(alloc.start_datetime).toISOString().slice(0, 10);
      if (dayMap[key]) {
        dayMap[key].bookings++;
        dayMap[key].attendees += (alloc.student_count || 35);
      }
    }

    res.json({ success: true, data: Object.values(dayMap) });
  } catch (err) {
    next(err);
  }
});

// 3. GET /api/analytics/by-facility-type
router.get('/by-facility-type', async (req, res, next) => {
  try {
    const allocations = await db.getAllAllocations();
    const facilities = await db.getAllFacilities();
    const days = parseInt(req.query.days || '30', 10);
    const filtered = filterByRange(allocations, days);

    const typeMap = {
      'Classroom': { type: 'Classroom', count: 0, totalHours: 0, color: '#4F46E5' },
      'Lab': { type: 'Lab', count: 0, totalHours: 0, color: '#06B6D4' },
      'Auditorium': { type: 'Auditorium', count: 0, totalHours: 0, color: '#8B5CF6' },
      'Sports Ground': { type: 'Sports Ground', count: 0, totalHours: 0, color: '#10B981' },
      'Seminar Hall': { type: 'Seminar Hall', count: 0, totalHours: 0, color: '#F59E0B' }
    };

    for (const alloc of filtered) {
      const fType = alloc.facility_type || 'Classroom';
      if (!typeMap[fType]) {
        typeMap[fType] = { type: fType, count: 0, totalHours: 0, color: '#64748B' };
      }
      typeMap[fType].count++;

      const s = new Date(alloc.start_datetime).getTime();
      const e = new Date(alloc.end_datetime).getTime();
      const hours = Math.max(1, Math.round((e - s) / (1000 * 60 * 60)));
      typeMap[fType].totalHours += hours;
    }

    const totalCount = Object.values(typeMap).reduce((acc, curr) => acc + curr.count, 0) || 1;
    const result = Object.values(typeMap).map(item => ({
      ...item,
      percentage: Math.round((item.count / totalCount) * 100)
    }));

    res.json({ success: true, totalBookings: totalCount, data: result });
  } catch (err) {
    next(err);
  }
});

// 4. GET /api/analytics/top-facilities
router.get('/top-facilities', async (req, res, next) => {
  try {
    const allocations = await db.getAllAllocations();
    const facilities = await db.getAllFacilities();
    const days = parseInt(req.query.days || '30', 10);
    const filtered = filterByRange(allocations, days);

    const facMap = {};
    for (const fac of facilities) {
      facMap[fac.id] = {
        id: fac.id,
        name: fac.name,
        type: fac.type,
        capacity: fac.capacity,
        bookings: 0,
        totalHours: 0
      };
    }

    for (const alloc of filtered) {
      if (facMap[alloc.facility_id]) {
        facMap[alloc.facility_id].bookings++;
        const s = new Date(alloc.start_datetime).getTime();
        const e = new Date(alloc.end_datetime).getTime();
        const hours = Math.max(1, Math.round((e - s) / (1000 * 60 * 60)));
        facMap[alloc.facility_id].totalHours += hours;
      }
    }

    const top5 = Object.values(facMap)
      .sort((a, b) => b.bookings - a.bookings || b.totalHours - a.totalHours)
      .slice(0, 5);

    res.json({ success: true, data: top5 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
