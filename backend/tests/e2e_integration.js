const assert = require('assert');

async function verifyFullEndToEndFlow() {
  console.log('🚀 Running Comprehensive End-to-End System Verification...');
  const API_URL = 'http://127.0.0.1:5000/api';
  const AI_URL = 'http://127.0.0.1:8000';
  const FRONTEND_URL = 'http://127.0.0.1:5173';

  // 1. Verify all 3 service health endpoints
  console.log('1️⃣ Checking Services Health...');
  const aiHealth = await fetch(`${AI_URL}/health`).then(r => r.json());
  assert.strictEqual(aiHealth.status, 'healthy', 'AI Engine must be healthy');
  console.log('   ✅ FastAPI AI Engine is Healthy on port 8000');

  const backendHealth = await fetch(`${API_URL}/health`).then(r => r.json());
  assert.strictEqual(backendHealth.status, 'healthy', 'Backend must be healthy');
  console.log('   ✅ Express Backend is Healthy on port 5000');

  const frontendRes = await fetch(FRONTEND_URL);
  assert.strictEqual(frontendRes.status, 200, 'Frontend must serve HTTP 200');
  console.log('   ✅ React Vite Frontend is Live on port 5173');

  // 2. Fetch Initial Dashboard Statistics
  console.log('\n2️⃣ Fetching Initial Dashboard State...');
  const initialStats = await fetch(`${API_URL}/dashboard/stats`).then(r => r.json());
  assert.strictEqual(initialStats.success, true);
  assert.strictEqual(initialStats.stats.totalFacilities, 12);
  assert.strictEqual(initialStats.facilityGrid.length, 12);
  console.log(`   ✅ 12 Facilities verified with availability statuses`);

  // 3. Submit Facility Booking Request to Constraint & AI Scoring Engine
  console.log('\n3️⃣ Evaluating New Request with Constraint & AI Suggestion Pipeline...');
  const requestPayload = {
    event_name: 'Deep Learning Hands-on Bootcamp',
    event_type: 'Workshop',
    student_count: 42,
    start_datetime: '2026-10-15 10:00:00',
    end_datetime: '2026-10-15 13:00:00',
    facility_type: 'Lab',
    required_equipment: ['Computers', 'AC', 'Projector']
  };

  const analysisRes = await fetch(`${API_URL}/requests/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestPayload)
  }).then(r => r.json());

  assert.strictEqual(analysisRes.success, true);
  assert.strictEqual(analysisRes.audit.schedule_valid, true);
  assert.ok(analysisRes.candidates_count > 0, 'Should find matching lab candidates');
  assert.ok(analysisRes.suggestions.primary !== null, 'Primary recommendation must exist');
  assert.ok(analysisRes.suggestions.primary.score >= 80, 'Primary venue score should be high');
  assert.ok(analysisRes.suggestions.alternatives.length > 0, 'Alternatives should be generated');

  const primary = analysisRes.suggestions.primary;
  console.log(`   ✅ AI Primary Match: ${primary.facility_name} (Score: ${primary.score}/100)`);
  console.log(`      Reason: "${primary.reason}"`);
  console.log(`   ✅ Evaluated ${analysisRes.suggestions.alternatives.length} Alternative Options with Trade-offs:`);
  analysisRes.suggestions.alternatives.forEach((alt, i) => {
    console.log(`      Alt ${i+1}: ${alt.facility_name} (Score: ${alt.score}/100) - ${alt.trade_off}`);
  });

  // 4. Confirm Primary Facility Allocation
  console.log('\n4️⃣ Executing Transactional Allocation Confirmation...');
  const confirmPayload = {
    request_id: analysisRes.request.id,
    facility_id: primary.facility_id,
    start_datetime: requestPayload.start_datetime,
    end_datetime: requestPayload.end_datetime
  };

  const confirmRes = await fetch(`${API_URL}/allocations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(confirmPayload)
  });

  assert.strictEqual(confirmRes.status, 201, 'Allocation confirmation should return 201 Created');
  const confirmData = await confirmRes.json();
  assert.strictEqual(confirmData.success, true);
  assert.strictEqual(confirmData.data.facility_id, primary.facility_id);
  console.log(`   ✅ Allocation #${confirmData.data.id} Confirmed & Locked for Venue #${primary.facility_id}`);

  // 5. Test Transaction Conflict Guard (409 Conflict)
  console.log('\n5️⃣ Testing Double-Booking Collision Guard (409 Conflict)...');
  const duplicateRes = await fetch(`${API_URL}/allocations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(confirmPayload)
  });
  assert.strictEqual(duplicateRes.status, 409, 'Duplicate booking must trigger 409 Conflict');
  const conflictData = await duplicateRes.json();
  assert.strictEqual(conflictData.error, 'Slot Conflict');
  console.log(`   ✅ 409 Conflict correctly detected: "${conflictData.message}"`);

  // 6. Verify Dashboard & Analytics Updates
  console.log('\n6️⃣ Verifying Analytics & Dashboard Propagation...');
  const updatedAllocations = await fetch(`${API_URL}/allocations`).then(r => r.json());
  const foundAlloc = updatedAllocations.data.find(a => a.id === confirmData.data.id);
  assert.ok(foundAlloc !== undefined, 'New allocation must be present in allocations list');
  console.log(`   ✅ Allocation #${confirmData.data.id} found in global bookings registry`);

  const hourlyAnalytics = await fetch(`${API_URL}/analytics/utilization-by-hour?days=30`).then(r => r.json());
  assert.strictEqual(hourlyAnalytics.success, true);
  assert.ok(hourlyAnalytics.data.length > 0, 'Hourly utilization points must be returned');

  const weeklyAnalytics = await fetch(`${API_URL}/analytics/weekly-bookings?days=7`).then(r => r.json());
  assert.strictEqual(weeklyAnalytics.success, true);

  const typeAnalytics = await fetch(`${API_URL}/analytics/by-facility-type?days=30`).then(r => r.json());
  assert.strictEqual(typeAnalytics.success, true);

  const topFacilities = await fetch(`${API_URL}/analytics/top-facilities?days=30`).then(r => r.json());
  assert.strictEqual(topFacilities.success, true);
  console.log(`   ✅ All 4 Analytics aggregation pipelines verified`);

  console.log('\n🎉 ALL END-TO-END INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
}

verifyFullEndToEndFlow().catch(err => {
  console.error('❌ Integration test failed:', err);
  process.exit(1);
});
