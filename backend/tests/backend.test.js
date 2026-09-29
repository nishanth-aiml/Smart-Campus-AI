const app = require('../server');
const db = require('../db');
const request = require('supertest');

describe('Smart Campus Express Backend API Tests', () => {
  beforeAll(async () => {
    await db.initialize();
  });

  test('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('GET /api/facilities returns 12 facilities', async () => {
    const res = await request(app).get('/api/facilities');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(12);
  });

  test('GET /api/dashboard/stats returns stats and facility grid', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.stats.totalFacilities).toBe(12);
    expect(res.body.facilityGrid.length).toBe(12);
  });

  test('POST /api/requests/analyze evaluates constraints and returns candidates', async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const payload = {
      event_name: 'Advanced AI Seminar',
      event_type: 'Seminar',
      student_count: 50,
      start_datetime: `${todayStr} 14:00:00`,
      end_datetime: `${todayStr} 16:00:00`,
      facility_type: 'Seminar Hall',
      required_equipment: ['Projector', 'AC']
    };

    const res = await request(app).post('/api/requests/analyze').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.audit).toBeDefined();
    expect(res.body.audit.schedule_valid).toBe(true);
    expect(res.body.suggestions).toBeDefined();
  });

  test('POST /api/requests/analyze rejects invalid hours outside 08:00-20:00', async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const payload = {
      event_name: 'Late Night Coding',
      event_type: 'Hackathon',
      student_count: 30,
      start_datetime: `${todayStr} 21:00:00`,
      end_datetime: `${todayStr} 23:00:00`,
      facility_type: 'Lab',
      required_equipment: ['Computers']
    };

    const res = await request(app).post('/api/requests/analyze').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Schedule');
  });

  test('POST /api/allocations handles creation and detects 409 conflicts', async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const allocPayload = {
      facility_id: 1,
      start_datetime: `${todayStr} 08:00:00`,
      end_datetime: `${todayStr} 10:00:00`
    };

    // First booking should succeed (or conflict if seed overlaps, so pick a clear date)
    const futureDate = '2026-11-15';
    const cleanPayload = {
      facility_id: 1,
      start_datetime: `${futureDate} 09:00:00`,
      end_datetime: `${futureDate} 11:00:00`
    };

    const res1 = await request(app).post('/api/allocations').send(cleanPayload);
    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);

    // Duplicate booking for same facility & overlapping slot must return 409 Conflict
    const res2 = await request(app).post('/api/allocations').send(cleanPayload);
    expect(res2.status).toBe(409);
    expect(res2.body.error).toBe('Slot Conflict');
  });

  test('GET /api/analytics endpoints return formatted data', async () => {
    const r1 = await request(app).get('/api/analytics/utilization-by-hour');
    expect(r1.status).toBe(200);
    expect(Array.isArray(r1.body.data)).toBe(true);

    const r2 = await request(app).get('/api/analytics/weekly-bookings');
    expect(r2.status).toBe(200);
    expect(Array.isArray(r2.body.data)).toBe(true);

    const r3 = await request(app).get('/api/analytics/by-facility-type');
    expect(r3.status).toBe(200);
    expect(Array.isArray(r3.body.data)).toBe(true);

    const r4 = await request(app).get('/api/analytics/top-facilities');
    expect(r4.status).toBe(200);
    expect(Array.isArray(r4.body.data)).toBe(true);
  });
});
