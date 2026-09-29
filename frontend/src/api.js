const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to load dashboard statistics');
  return res.json();
}

export async function fetchFacilities() {
  const res = await fetch(`${API_BASE}/facilities`);
  if (!res.ok) throw new Error('Failed to load campus facilities');
  return res.json();
}

export async function fetchAllocations() {
  const res = await fetch(`${API_BASE}/allocations`);
  if (!res.ok) throw new Error('Failed to load allocations');
  return res.json();
}

export async function analyzeRequest(requestData) {
  const res = await fetch(`${API_BASE}/requests/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Request analysis failed');
    err.status = res.status;
    err.audit = data.audit;
    throw err;
  }
  return data;
}

export async function confirmAllocation(allocationData) {
  const res = await fetch(`${API_BASE}/allocations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allocationData),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to confirm allocation');
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function fetchAnalytics(endpoint, days = 30) {
  const res = await fetch(`${API_BASE}/analytics/${endpoint}?days=${days}`);
  if (!res.ok) throw new Error(`Failed to load analytics for ${endpoint}`);
  return res.json();
}
