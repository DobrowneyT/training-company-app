/**
 * @fileoverview Admin API routes
 * @description Handles admin authentication and management endpoints
 * @version 1.0.0
 */

const express = require('express');
const adminService = require('../services/adminService');
const { authenticateAdmin, authorizeRole } = require('../middleware/auth');

const router = express.Router();

/**
 * Admin login endpoint
 * @route POST /login
 * @description Authenticates admin user and returns JWT token
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Admin username
 * @param {string} req.body.password - Admin password
 * @returns {Object} Success response with token and admin data
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Authenticate admin
    const result = await adminService.authenticateAdmin(username, password);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error.message === 'Invalid credentials' || error.message === 'Account is inactive') {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * Create new admin user endpoint
 * @route POST /create
 * @description Creates a new admin user (admin only)
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - New admin username
 * @param {string} req.body.password - New admin password
 * @param {string} [req.body.email] - New admin email
 * @param {string} [req.body.role] - New admin role
 * @returns {Object} Success response with created admin data
 */
router.post('/create', authenticateAdmin, authorizeRole(['admin']), async (req, res) => {
  try {
    const adminData = req.body;
    
    const newAdmin = await adminService.createAdmin(adminData);
    
    res.status(201).json({
      success: true,
      data: newAdmin
    });
    
  } catch (error) {
    console.error('Admin creation error:', error);
    
    if (error.message.includes('Username already exists') || 
        error.message.includes('Password must be')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create admin user'
    });
  }
});

// All routes below require authentication
router.use(authenticateAdmin);

/**
 * Get admin profile endpoint
 * @route GET /profile
 * @description Returns current admin user profile
 * @returns {Object} Admin profile data
 */
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      admin: req.admin
    }
  });
});

/**
 * Get admin dashboard data
 * @route GET /dashboard
 * @description Returns admin dashboard with users and statistics
 * @returns {Object} Dashboard data including users and stats
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [users, stats] = await Promise.all([
      adminService.getAllUsers(),
      adminService.getAdminStats()
    ]);
    
    res.json({
      success: true,
      data: {
        users,
        stats,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin dashboard data'
    });
  }
});

/**
 * Get all users endpoint
 * @route GET /users
 * @description Returns list of all users with training data
 * @returns {Object} List of users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    
    res.json({
      success: true,
      data: {
        users,
        count: users.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

/**
 * Assign training to user
 * @route POST /users/:userId/training
 * @description Assigns training to a specific user
 * @param {string} req.params.userId - User ID
 * @param {Object} req.body - Training assignment data
 * @param {string} req.body.currentStat - Stat to train
 * @param {number} req.body.trainsRemaining - Number of sessions
 * @param {number} [req.body.targetLevel] - Target level
 * @param {string} [req.body.notes] - Assignment notes
 * @returns {Object} Created training assignment
 */
router.post('/users/:userId/training', async (req, res) => {
  try {
    const { userId } = req.params;
    const trainingData = req.body;
    
    // Validate required fields
    if (!trainingData.currentStat || trainingData.trainsRemaining === undefined) {
      return res.status(400).json({
        success: false,
        error: 'currentStat and trainsRemaining are required'
      });
    }
    
    const training = await adminService.assignTraining(userId, trainingData, req.admin.id);
    
    res.json({
      success: true,
      data: training
    });
    
  } catch (error) {
    console.error('Training assignment error:', error);
    
    if (error.message === 'User not found' || 
        error.message === 'Invalid stat type' ||
        error.message.includes('must be a non-negative integer')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to assign training'
    });
  }
});

/**
 * Update training progress
 * @route PUT /users/:userId/training/progress
 * @description Updates training progress for a user
 * @param {string} req.params.userId - User ID
 * @param {Object} req.body - Progress update data
 * @param {number} [req.body.decrement=1] - Sessions to subtract
 * @returns {Object} Updated training progress
 */
router.put('/users/:userId/training/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const { decrement = 1 } = req.body;
    
    // Validate decrement value
    if (!Number.isInteger(decrement) || decrement < 1) {
      return res.status(400).json({
        success: false,
        error: 'Decrement must be a positive integer'
      });
    }
    
    const result = await adminService.updateTrainingProgress(userId, decrement, req.admin.id);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Training progress error:', error);
    
    if (error.message === 'No active training found for user') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update training progress'
    });
  }
});

/**
 * Get admin statistics
 * @route GET /stats
 * @description Returns admin dashboard statistics
 * @returns {Object} Statistics data
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await adminService.getAdminStats();
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * Admin API health check
 * @route GET /health
 * @description Returns admin API health status
 * @returns {Object} Health status
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'admin-api',
    timestamp: new Date().toISOString(),
    admin: req.admin ? req.admin.username : 'not authenticated'
  });
});

module.exports = router;
