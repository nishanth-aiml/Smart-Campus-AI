const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./db');
const facilitiesRouter = require('./routes/facilities');
const dashboardRouter = require('./routes/dashboard');
const requestsRouter = require('./routes/requests');
const allocationsRouter = require('./routes/allocations');
const analyticsRouter = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'smart-campus-backend',
    database_mode: db.isMock() ? 'in-memory-relational' : 'mysql'
  });
});

// Mount modular API routers
app.use('/api/facilities', facilitiesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/allocations', allocationsRouter);
app.use('/api/analytics', analyticsRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.url} does not exist.`
  });
});

// Centralized Error Handling Middleware (Consistent { error, message } format)
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred processing your request.'
  });
});

// Bootstrap Database and start server
async function startServer() {
  await db.initialize();
  app.listen(PORT, () => {
    console.log(`🚀 Smart Campus Express Backend running on http://localhost:${PORT}`);
  });
}

startServer();

module.exports = app;
