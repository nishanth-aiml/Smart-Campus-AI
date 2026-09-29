const express = require('express');
const cors = require('cors');
const db = require('../backend/db');
const facilitiesRouter = require('../backend/routes/facilities');
const dashboardRouter = require('../backend/routes/dashboard');
const requestsRouter = require('../backend/routes/requests');
const allocationsRouter = require('../backend/routes/allocations');
const analyticsRouter = require('../backend/routes/analytics');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize DB on cold start
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    await db.initialize();
    dbInitialized = true;
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'smart-campus-vercel-serverless',
    database_mode: db.isMock() ? 'in-memory-relational' : 'mysql'
  });
});

// Mount Routes
app.use('/api/facilities', facilitiesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/allocations', allocationsRouter);
app.use('/api/analytics', analyticsRouter);

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An error occurred processing your request.'
  });
});

module.exports = app;
