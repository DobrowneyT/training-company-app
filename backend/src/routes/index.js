/**
 * @fileoverview Main API routes index
 * @description Configures and mounts all API route modules
 * @version 1.0.0
 */

const express = require('express');
const clientRoutes = require('./client');

const router = express.Router();

/**
 * Mount route modules
 */
router.use('/client', clientRoutes);

/**
 * API information endpoint
 * @route GET /
 * @description Returns API information and available endpoints
 * @returns {Object} API metadata
 */
router.get('/', (req, res) => {
  res.json({
    name: 'Training Company API',
    version: '1.0.0',
    description: 'Backend API for Training Company Management Application',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      client: {
        verify: 'POST /api/client/verify - Verify API key and register user',
        dashboard: 'GET /api/client/dashboard/:tornId - Get dashboard data',
        stats: 'GET /api/client/stats/:tornId - Get work stats',
        health: 'GET /api/client/health - Client API health check'
      },
      admin: '/api/admin/* - Admin endpoints (coming soon)',
      discord: '/api/discord/* - Discord integration (coming soon)'
    },
    documentation: 'https://github.com/your-username/training-company-app/docs'
  });
});

/**
 * API health check
 * @route GET /health
 * @description Returns overall API health status
 * @returns {Object} API health status
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'training-company-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
