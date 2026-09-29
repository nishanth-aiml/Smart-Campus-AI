const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');
const db = require('../db');
const { evaluateConstraints } = require('../constraintEngine');

// Helper to call Python FastAPI AI engine if available
function callAIEngine(payload) {
  return new Promise((resolve, reject) => {
    const aiUrl = new URL(process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000/suggest');
    const dataString = JSON.stringify(payload);

    const client = aiUrl.protocol === 'https:' ? https : http;
    const req = client.request(
      aiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString)
        },
        timeout: 2000
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`AI Engine error: HTTP ${res.statusCode} - ${body}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('AI Engine request timed out'));
    });

    req.write(dataString);
    req.end();
  });
}

// Complete 4-Factor Deterministic Scoring Engine (Vercel Serverless & Local Standalone)
function calculateDeterministicScore(request, candidates) {
  if (!candidates || candidates.length === 0) {
    return { primary: null, alternatives: [], fallback: false };
  }

  const bookingCounts = candidates.map(c => c.historical_booking_count || 0);
  const maxB = Math.max(...bookingCounts, 1);
  const minB = Math.min(...bookingCounts, 0);

  const scoredList = candidates.map(cand => {
    // 1. Capacity Fit (35%)
    let capRaw = 0;
    const ratio = cand.capacity / Math.max(request.student_count, 1);
    if (cand.capacity >= request.student_count) {
      if (ratio === 1.0) capRaw = 100.0;
      else if (ratio <= 1.25) capRaw = 100.0 - (ratio - 1.0) * 40.0;
      else if (ratio <= 1.75) capRaw = 90.0 - (ratio - 1.25) * 40.0;
      else if (ratio <= 2.0) capRaw = 70.0 - (ratio - 1.75) * 60.0;
      else capRaw = Math.max(10.0, 55.0 - (ratio - 2.0) * 15.0);
    }

    // 2. Equipment Match (30%)
    let eqRaw = 100.0;
    const reqEq = request.required_equipment || [];
    if (reqEq.length > 0) {
      const facEqLower = new Set((cand.equipment || []).map(e => e.trim().toLowerCase()));
      const matched = reqEq.filter(e => facEqLower.has(e.trim().toLowerCase()));
      eqRaw = (matched.length / reqEq.length) * 100.0;
    }

    // 3. Facility Type Match (15%)
    const typeRaw = (cand.type || '').toLowerCase() === (request.facility_type || '').toLowerCase() ? 100.0 : 0.0;

    // 4. Historical Utilization Balancing (20%)
    let utilRaw = 85.0;
    if (maxB !== minB) {
      const utilRatio = ((cand.historical_booking_count || 0) - minB) / Math.max(maxB - minB, 1);
      utilRaw = 100.0 - (utilRatio * 50.0);
    }

    const totalScore = Math.round(
      Math.max(0, Math.min(100, (capRaw * 0.35) + (eqRaw * 0.30) + (typeRaw * 0.15) + (utilRaw * 0.20))) * 10
    ) / 10;

    return {
      cand,
      score: totalScore,
      breakdown: {
        capacity_fit: Math.round(capRaw * 0.35 * 10) / 10,
        equipment_match: Math.round(eqRaw * 0.30 * 10) / 10,
        facility_type_match: Math.round(typeRaw * 0.15 * 10) / 10,
        utilization_balance: Math.round(utilRaw * 0.20 * 10) / 10
      },
      capRaw,
      eqRaw,
      utilRaw
    };
  });

  // Sort descending by score; tie-breaker closest capacity
  scoredList.sort((a, b) => b.score - a.score || Math.abs(a.cand.capacity - request.student_count) - Math.abs(b.cand.capacity - request.student_count));

  const results = scoredList.map((item, idx) => {
    const isPrimary = idx === 0;
    const { cand, score, breakdown, eqRaw } = item;
    const eqList = (cand.equipment || []).join(', ') || 'standard setup';

    let s1 = '';
    if (cand.capacity === request.student_count) {
      s1 = `Exact capacity match with ${cand.capacity} seats for ${request.student_count} attendees in ${cand.building}.`;
    } else if (cand.capacity <= request.student_count * 1.3) {
      s1 = `Optimal capacity fit with ${cand.capacity} seats for ${request.student_count} attendees in ${cand.building}.`;
    } else if (cand.capacity <= request.student_count * 2.0) {
      s1 = `Comfortable capacity of ${cand.capacity} seats accommodating ${request.student_count} attendees in ${cand.building}.`;
    } else {
      const oversize = Math.round((cand.capacity / request.student_count) * 10) / 10;
      s1 = `Larger venue with ${cand.capacity} seats (${oversize}x requested size) in ${cand.building}.`;
    }

    let s2 = '';
    let trade_off = null;

    if (isPrimary) {
      if (eqRaw === 100 && (request.required_equipment || []).length > 0) {
        s2 = `Equipped with all requested items (${eqList}) while keeping campus utilization balanced.`;
      } else {
        s2 = `Provides ideal environment on ${cand.floor} with balanced historical utilization.`;
      }
    } else {
      s2 = `Available on ${cand.floor} with ${cand.historical_booking_count || 0} recorded bookings.`;
      const tradeoffs = [];
      if (cand.capacity > request.student_count * 1.5) {
        tradeoffs.append || tradeoffs.push(`+${cand.capacity - request.student_count} surplus seats`);
      }
      tradeoffs.push(`located on ${cand.floor} of ${cand.building}`);
      trade_off = `Trade-off: ${tradeoffs.join('; ')}.`;
    }

    return {
      facility_id: cand.id,
      facility_name: cand.name,
      facility_type: cand.type,
      capacity: cand.capacity,
      building: cand.building,
      floor: cand.floor,
      equipment: cand.equipment || [],
      score,
      breakdown,
      reason: `${s1} ${s2}`.trim(),
      trade_off
    };
  });

  return {
    primary: results[0] || null,
    alternatives: results.slice(1, 4),
    fallback: false
  };
}

// POST /api/requests/analyze
router.post('/analyze', async (req, res, next) => {
  try {
    const {
      event_name,
      event_type,
      student_count,
      start_datetime,
      end_datetime,
      facility_type,
      required_equipment = []
    } = req.body;

    if (!event_name || !event_type || !student_count || !start_datetime || !end_datetime || !facility_type) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'All fields (event_name, event_type, student_count, start_datetime, end_datetime, facility_type) are required.'
      });
    }

    const countNum = parseInt(student_count, 10);
    if (isNaN(countNum) || countNum <= 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Student count must be a positive integer.'
      });
    }

    const normalizedReq = {
      event_name: event_name.trim(),
      event_type: event_type.trim(),
      student_count: countNum,
      start_datetime,
      end_datetime,
      facility_type: facility_type.trim(),
      required_equipment: Array.isArray(required_equipment) ? required_equipment : []
    };

    // 1. Run Constraint Engine
    const constraintResult = await evaluateConstraints(normalizedReq);

    if (!constraintResult.schedule_valid) {
      return res.status(400).json({
        error: 'Invalid Schedule',
        message: constraintResult.error_reason,
        audit: constraintResult.audit
      });
    }

    const candidates = constraintResult.candidates;
    const savedRequest = await db.saveRequest(normalizedReq);

    if (candidates.length === 0) {
      return res.json({
        success: true,
        request: savedRequest,
        candidates_count: 0,
        suggestions: {
          primary: null,
          alternatives: [],
          fallback: false
        },
        audit: constraintResult.audit,
        message: 'No facilities met all strict constraints (capacity, type, equipment, and availability).'
      });
    }

    // 2. Dispatch to AI Engine (FastAPI or Serverless Scoring)
    let suggestionResult;
    try {
      suggestionResult = await callAIEngine({
        request: normalizedReq,
        candidates
      });
    } catch (aiErr) {
      // Direct high-performance deterministic scoring
      suggestionResult = calculateDeterministicScore(normalizedReq, candidates);
    }

    res.json({
      success: true,
      request: savedRequest,
      candidates_count: candidates.length,
      suggestions: suggestionResult,
      audit: constraintResult.audit
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
