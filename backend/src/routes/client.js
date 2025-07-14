/**
 * @fileoverview Client API routes
 * @description Handles client-facing API endpoints for user registration and dashboard
 * @version 1.0.0
 */

const express = require('express');
const userService = require('../services/userService');

const router = express.Router();

/**
 * Verify API key and register/login user
 * @route POST /verify
 * @description Verifies Torn API key and creates/updates user account
 * @param {Object} req.body - Request body
 * @param {string} req.body.apiKey - Torn API key (16 characters)
 * @returns {Object} Success/error response with user data
 */
router.post('/verify', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    // Validate input
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }
    
    if (typeof apiKey !== 'string' || apiKey.length !== 16) {
      return res.status(400).json({
        success: false,
        error: 'API key must be exactly 16 characters'
      });
    }
    
    // Verify and create/update user
    const result = await userService.verifyAndCreateUser(apiKey);
    
    if (result.success) {
      console.log(`User verification successful: ${result.user.name} [${result.user.tornId}]`);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Client verify endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get user dashboard data
 * @route GET /dashboard/:tornId
 * @description Retrieves user training data and current work stats
 * @param {string} req.params.tornId - Torn user ID
 * @returns {Object} Dashboard data including training and stats
 */
router.get('/dashboard/:tornId', async (req, res) => {
  try {
    const { tornId } = req.params;
    
    // Validate torn ID
    const tornIdNumber = parseInt(tornId);
    if (isNaN(tornIdNumber) || tornIdNumber <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Torn user ID'
      });
    }
    
    // Get training data
    const trainingData = await userService.getUserTrainingData(tornIdNumber);
    
    // Get current work stats
    const currentStats = await userService.getCurrentWorkStats(tornIdNumber);
    
    res.json({
      success: true,
      data: {
        ...trainingData,
        currentStats,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Dashboard endpoint error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (error.message === 'User account is inactive') {
      return res.status(403).json({
        success: false,
        error: 'User account is inactive'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
});

/**
 * Get user's current work stats only
 * @route GET /stats/:tornId
 * @description Retrieves only the current work stats from Torn API
 * @param {string} req.params.tornId - Torn user ID
 * @returns {Object} Work stats data
 */
router.get('/stats/:tornId', async (req, res) => {
  try {
    const { tornId } = req.params;
    
    // Validate torn ID
    const tornIdNumber = parseInt(tornId);
    if (isNaN(tornIdNumber) || tornIdNumber <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Torn user ID'
      });
    }
    
    const stats = await userService.getCurrentWorkStats(tornIdNumber);
    
    if (stats === null) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve work stats'
      });
    }
    
    res.json({
      success: true,
      data: {
        stats,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Stats endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve work stats'
    });
  }
});

/**
 * Health check for client API
 * @route GET /health
 * @description Returns client API health status
 * @returns {Object} Health status
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'client-api',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
