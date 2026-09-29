const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');
const db = require('../db');
const { evaluateConstraints } = require('../constraintEngine');

// Helper to call Python FastAPI AI engine using native http
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
        timeout: 3000
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

// Fallback scoring if AI engine is offline
function fallbackCapacityRanking(request, candidates) {
  if (!candidates || candidates.length === 0) {
    return { primary: null, alternatives: [], fallback: true };
  }

  // Sort by capacity delta (tightest fit first)
  const sorted = [...candidates].sort((a, b) => {
    const deltaA = a.capacity - request.student_count;
    const deltaB = b.capacity - request.student_count;
    return deltaA - deltaB;
  });

  const scored = sorted.map((cand, idx) => {
    const isPrimary = idx === 0;
    const score = Math.max(50, Math.min(95, 95 - (cand.capacity - request.student_count) * 0.5));
    const reason = `Facility ${cand.name} with ${cand.capacity} seats fulfills capacity requirements for ${request.student_count} attendees. Ranked using local capacity-fit fallback.`;
    const trade_off = isPrimary ? null : `Trade-off: ${cand.capacity - request.student_count} extra seats on ${cand.floor}.`;

    return {
      facility_id: cand.id,
      facility_name: cand.name,
      facility_type: cand.type,
      capacity: cand.capacity,
      building: cand.building,
      floor: cand.floor,
      equipment: cand.equipment,
      score: Math.round(score * 10) / 10,
      breakdown: {
        capacity_fit: Math.round(score * 0.5 * 10) / 10,
        equipment_match: 25.0,
        facility_type_match: 15.0,
        utilization_balance: 10.0
      },
      reason,
      trade_off
    };
  });

  return {
    primary: scored[0] || null,
    alternatives: scored.slice(1, 4),
    fallback: true
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

    // Validate inputs
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

    // 2. Save Request to DB for tracking
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

    // 3. Dispatch to AI Suggestion Engine
    let suggestionResult;
    try {
      suggestionResult = await callAIEngine({
        request: normalizedReq,
        candidates
      });
    } catch (aiErr) {
      console.warn('⚠️ AI Engine unreachable, activating capacity fallback:', aiErr.message);
      suggestionResult = fallbackCapacityRanking(normalizedReq, candidates);
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
