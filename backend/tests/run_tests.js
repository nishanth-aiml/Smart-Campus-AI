const assert = require('assert');
const http = require('http');
const app = require('../server');

async function runAllTests() {
  console.log('🧪 Running Backend Integration Tests...');
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5099, resolve));
  const baseUrl = 'http://127.0.0.1:5099';

  try {
    // 1. Health check
    console.log('-> Testing /api/health');
    const rHealth = await fetch(`${baseUrl}/api/health`).then(r => r.json());
    assert.strictEqual(rHealth.status, 'healthy');

    // 2. Facilities
    console.log('-> Testing /api/facilities');
    const rFac = await fetch(`${baseUrl}/api/facilities`).then(r => r.json());
    assert.strictEqual(rFac.success, true);
    assert.strictEqual(rFac.data.length, 12);

    // 3. Dashboard stats
    console.log('-> Testing /api/dashboard/stats');
    const rDash = await fetch(`${baseUrl}/api/dashboard/stats`).then(r => r.json());
    assert.strictEqual(rDash.success, true);
    assert.strictEqual(rDash.stats.totalFacilities, 12);
    assert.strictEqual(rDash.facilityGrid.length, 12);

    // 4. Request analysis & constraints
    console.log('-> Testing /api/requests/analyze');
    const todayStr = new Date().toISOString().slice(0, 10);
    const rAnalyze = await fetch(`${baseUrl}/api/requests/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'Seminar on Quantum Physics',
        event_type: 'Seminar',
        student_count: 60,
        start_datetime: `${todayStr} 14:00:00`,
        end_datetime: `${todayStr} 16:00:00`,
        facility_type: 'Seminar Hall',
        required_equipment: ['Projector', 'AC']
      })
    }).then(r => r.json());
    assert.strictEqual(rAnalyze.success, true);
    assert.strictEqual(rAnalyze.audit.schedule_valid, true);
    assert.ok(rAnalyze.suggestions !== undefined);

    // 5. Invalid schedule window (night time)
    console.log('-> Testing schedule constraint rejection (22:00)');
    const rInvalid = await fetch(`${baseUrl}/api/requests/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'Night Hack',
        event_type: 'Hackathon',
        student_count: 20,
        start_datetime: `${todayStr} 22:00:00`,
        end_datetime: `${todayStr} 23:00:00`,
        facility_type: 'Lab'
      })
    });
    assert.strictEqual(rInvalid.status, 400);

    // 6. Allocations & 409 Conflict Check
    console.log('-> Testing allocation booking & 409 conflict detection');
    const testSlot = {
      facility_id: 2,
      start_datetime: '2026-11-20 10:00:00',
      end_datetime: '2026-11-20 12:00:00'
    };

    const rAlloc1 = await fetch(`${baseUrl}/api/allocations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testSlot)
    });
    assert.strictEqual(rAlloc1.status, 201);

    // Duplicate allocation in same slot should return 409
    const rAlloc2 = await fetch(`${baseUrl}/api/allocations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testSlot)
    });
    assert.strictEqual(rAlloc2.status, 409);
    const errBody = await rAlloc2.json();
    assert.strictEqual(errBody.error, 'Slot Conflict');

    // 7. Analytics endpoints
    console.log('-> Testing analytics routes');
    const rHours = await fetch(`${baseUrl}/api/analytics/utilization-by-hour`).then(r => r.json());
    assert.strictEqual(rHours.success, true);

    const rWeek = await fetch(`${baseUrl}/api/analytics/weekly-bookings`).then(r => r.json());
    assert.strictEqual(rWeek.success, true);

    const rTypes = await fetch(`${baseUrl}/api/analytics/by-facility-type`).then(r => r.json());
    assert.strictEqual(rTypes.success, true);

    const rTop = await fetch(`${baseUrl}/api/analytics/top-facilities`).then(r => r.json());
    assert.strictEqual(rTop.success, true);

    console.log('✨ All 7 backend verification suites passed successfully!');
  } finally {
    server.close();
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
