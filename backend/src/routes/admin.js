/**
 * @fileoverview Admin API routes
 * @description Handles admin authentication and management endpoints
 * @version 1.0.0
 */

const express = require('express');
const adminService = require('../services/adminService');
const companyService = require('../services/companyService');
const { prisma } = require('../services/database');
const { authenticateAdmin, authorizeRole } = require('../middleware/auth');

const router = express.Router();

/**
 * Convert BigInt fields to strings for JSON serialization
 * @param {Object} company - Company object with potential BigInt fields
 * @returns {Object} Company object with BigInt fields converted to strings
 */
function serializeCompany(company) {
  if (!company) return company;
  
  return {
    ...company,
    companyBank: company.companyBank?.toString(),
    companyFunds: company.companyFunds?.toString()
  };
}

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

// =============================================================================
// COMPANY MANAGEMENT ENDPOINTS
// =============================================================================

/**
 * Get all companies with aggregated statistics
 * @route GET /companies
 * @description Returns all companies with employee counts, purchase stats, and training data
 * @returns {Object} List of companies with statistics
 */
router.get('/companies', async (req, res) => {
  try {
    const companies = await companyService.getAllCompaniesWithStats();
    
    res.json({
      success: true,
      data: {
        companies,
        count: companies.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies'
    });
  }
});

/**
 * Register a new company using Torn API
 * @route POST /companies/register
 * @description Registers a company by fetching data from Torn API using owner's API key
 * @param {Object} req.body - Request body
 * @param {string} req.body.apiKey - Owner's Torn API key
 * @param {number} req.body.ownerTornId - Owner's Torn user ID
 * @returns {Object} Created company data
 */
router.post('/companies/register', async (req, res) => {
  try {
    const { apiKey, ownerTornId } = req.body;
    
    // Validate input
    if (!apiKey || !ownerTornId) {
      return res.status(400).json({
        success: false,
        error: 'API key and owner Torn ID are required'
      });
    }
    
    if (typeof apiKey !== 'string' || apiKey.length !== 16) {
      return res.status(400).json({
        success: false,
        error: 'API key must be exactly 16 characters'
      });
    }
    
    const tornId = parseInt(ownerTornId);
    if (isNaN(tornId) || tornId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Torn user ID'
      });
    }
    
    // Register the company
    const company = await companyService.registerCompany(apiKey, tornId);
    
    // Log the registration
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'New company registered',
        data: JSON.stringify({
          companyId: company.id,
          companyName: company.name,
          ownerTornId: tornId,
          registeredBy: req.admin.id
        }),
        source: 'admin',
        userId: req.admin.id
      }
    });
    
    res.status(201).json({
      success: true,
      data: serializeCompany(company)
    });
    
  } catch (error) {
    console.error('Company registration error:', error);
    
    if (error.message.includes('No company data found')) {
      return res.status(400).json({
        success: false,
        error: 'User does not own a company or company data unavailable'
      });
    }
    
    if (error.message.includes('Torn API Error')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to register company'
    });
  }
});

/**
 * Update company settings
 * @route PUT /companies/:companyId
 * @description Updates company settings like TCP/TGP availability and advertising
 * @param {string} req.params.companyId - Company ID
 * @param {Object} req.body - Company settings to update
 * @returns {Object} Updated company data
 */
router.put('/companies/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { hasTCP, hasTGP, advertising } = req.body;
    
    // Validate company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }
    
    // Update company settings
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        hasTCP: hasTCP !== undefined ? Boolean(hasTCP) : undefined,
        hasTGP: hasTGP !== undefined ? Boolean(hasTGP) : undefined,
        advertising: advertising || undefined,
        updatedAt: new Date()
      }
    });
    
    // Log the update
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'Company settings updated',
        data: JSON.stringify({
          companyId,
          companyName: company.name,
          changes: { hasTCP, hasTGP, advertising },
          updatedBy: req.admin.id
        }),
        source: 'admin',
        userId: req.admin.id
      }
    });
    
    res.json({
      success: true,
      data: serializeCompany(updatedCompany)
    });
    
  } catch (error) {
    console.error('Company update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update company'
    });
  }
});

/**
 * Get detailed company information
 * @route GET /companies/:companyId/details
 * @description Returns detailed company info including employees and recent activity
 * @param {string} req.params.companyId - Company ID
 * @returns {Object} Detailed company data
 */
router.get('/companies/:companyId/details', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        owner: {
          select: { id: true, name: true, tornId: true, createdAt: true }
        },
        employees: {
          select: { 
            id: true, 
            name: true, 
            tornId: true, 
            companyRole: true,
            createdAt: true,
            training: {
              where: { isActive: true },
              select: { currentStat: true, trainsRemaining: true, targetLevel: true }
            }
          }
        },
        purchases: {
          orderBy: { purchaseDate: 'desc' },
          take: 10,
          select: {
            id: true,
            trainsPurchased: true,
            purchaseDate: true,
            notes: true
          }
        },
        trainingRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            buyer: {
              select: { name: true, tornId: true }
            }
          }
        }
      }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }
    
    // Calculate additional statistics
    const totalTrainsPurchased = company.purchases.reduce(
      (sum, purchase) => sum + purchase.trainsPurchased, 0
    );
    
    const activeTraining = company.employees.reduce(
      (sum, employee) => sum + employee.training.length, 0
    );
    
    const pendingRequests = company.trainingRequests.filter(
      req => req.status === 'pending'
    ).length;
    
    res.json({
      success: true,
      data: {
        ...serializeCompany(company),
        companyBank: company.companyBank.toString(), // Convert BigInt for JSON
        companyFunds: company.companyFunds.toString(),
        statistics: {
          totalTrainsPurchased,
          activeTraining,
          pendingRequests,
          employeeCount: company.employees.length
        }
      }
    });
    
  } catch (error) {
    console.error('Company details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company details'
    });
  }
});

// =============================================================================
// PURCHASE TRACKING ENDPOINTS
// =============================================================================

/**
 * Add purchase record for a company
 * @route POST /companies/:companyId/purchases
 * @description Records a manual purchase of training sessions for a company
 * @param {string} req.params.companyId - Company ID
 * @param {Object} req.body - Purchase data
 * @param {number} req.body.trainsPurchased - Number of trains purchased
 * @param {string} [req.body.notes] - Optional notes about the purchase
 * @returns {Object} Created purchase record
 */
router.post('/companies/:companyId/purchases', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { trainsPurchased, notes } = req.body;
    
    // Validate input
    if (!trainsPurchased || !Number.isInteger(trainsPurchased) || trainsPurchased <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Trains purchased must be a positive integer'
      });
    }
    
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }
    
    // Add purchase record
    const purchase = await companyService.addPurchase(
      companyId,
      trainsPurchased,
      notes,
      req.admin.id
    );
    
    res.status(201).json({
      success: true,
      data: purchase
    });
    
  } catch (error) {
    console.error('Add purchase error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add purchase record'
    });
  }
});

/**
 * Get purchase history for a company
 * @route GET /companies/:companyId/purchases
 * @description Returns purchase history for a specific company
 * @param {string} req.params.companyId - Company ID
 * @param {number} [req.query.limit] - Number of records to return (default: 50)
 * @param {number} [req.query.offset] - Number of records to skip (default: 0)
 * @returns {Object} Purchase history
 */
router.get('/companies/:companyId/purchases', async (req, res) => {
  try {
    const { companyId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }
    
    // Get purchase history
    const [purchases, totalCount] = await Promise.all([
      prisma.purchase.findMany({
        where: { companyId },
        orderBy: { purchaseDate: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.purchase.count({
        where: { companyId }
      })
    ]);
    
    // Calculate total trains purchased
    const totalTrainsPurchased = await prisma.purchase.aggregate({
      where: { companyId },
      _sum: { trainsPurchased: true }
    });
    
    res.json({
      success: true,
      data: {
        purchases,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        },
        summary: {
          totalTrainsPurchased: totalTrainsPurchased._sum.trainsPurchased || 0
        }
      }
    });
    
  } catch (error) {
    console.error('Get purchase history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase history'
    });
  }
});

// =============================================================================
// TRAINING REQUEST QUEUE ENDPOINTS
// =============================================================================

/**
 * Get all pending training requests across all companies
 * @route GET /training-requests
 * @description Returns all pending training requests for admin review
 * @param {string} [req.query.status] - Filter by status (default: 'pending')
 * @returns {Object} List of training requests
 */
router.get('/training-requests', async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    
    const requests = await prisma.trainingRequest.findMany({
      where: { status },
      include: {
        company: {
          select: { id: true, name: true, tornId: true }
        },
        buyer: {
          select: { id: true, name: true, tornId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: {
        requests,
        count: requests.length,
        status
      }
    });
    
  } catch (error) {
    console.error('Get training requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch training requests'
    });
  }
});

/**
 * Approve a training request
 * @route PUT /training-requests/:requestId/approve
 * @description Approves a training request and creates training assignments
 * @param {string} req.params.requestId - Training request ID
 * @param {Object} req.body - Approval data
 * @param {boolean} [req.body.paymentReceived] - Whether payment has been received
 * @param {number} [req.body.paymentAmount] - Payment amount received
 * @returns {Object} Updated training request
 */
router.put('/training-requests/:requestId/approve', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { paymentReceived = false, paymentAmount } = req.body;
    
    // Get the training request
    const request = await prisma.trainingRequest.findUnique({
      where: { id: requestId },
      include: {
        company: true,
        buyer: true
      }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Training request not found'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request is already ${request.status}`
      });
    }
    
    // Update request status
    const updatedRequest = await prisma.trainingRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        approvedBy: req.admin.id,
        approvedAt: new Date(),
        paymentReceived,
        paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
        paymentDate: paymentReceived ? new Date() : null
      }
    });
    
    // Create training assignment for the buyer
    await adminService.assignTraining(
      request.buyer.id,
      {
        currentStat: request.stat,
        trainsRemaining: request.quantity,
        targetLevel: request.targetLevel,
        notes: `Approved training request: ${request.notes || 'No additional notes'}`
      },
      req.admin.id
    );
    
    // Log the approval
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'Training request approved',
        data: JSON.stringify({
          requestId,
          companyName: request.company.name,
          buyerName: request.buyer.name,
          stat: request.stat,
          quantity: request.quantity,
          paymentReceived,
          approvedBy: req.admin.id
        }),
        source: 'admin',
        userId: req.admin.id
      }
    });
    
    res.json({
      success: true,
      data: updatedRequest
    });
    
  } catch (error) {
    console.error('Approve training request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve training request'
    });
  }
});

/**
 * Reject a training request
 * @route PUT /training-requests/:requestId/reject
 * @description Rejects a training request with optional reason
 * @param {string} req.params.requestId - Training request ID
 * @param {Object} req.body - Rejection data
 * @param {string} [req.body.reason] - Reason for rejection
 * @returns {Object} Updated training request
 */
router.put('/training-requests/:requestId/reject', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    // Get the training request
    const request = await prisma.trainingRequest.findUnique({
      where: { id: requestId },
      include: {
        company: { select: { name: true } },
        buyer: { select: { name: true } }
      }
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Training request not found'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request is already ${request.status}`
      });
    }
    
    // Update request status
    const updatedRequest = await prisma.trainingRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        approvedBy: req.admin.id,
        approvedAt: new Date(),
        notes: reason ? `${request.notes || ''}\n\nRejection reason: ${reason}`.trim() : request.notes
      }
    });
    
    // Log the rejection
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'Training request rejected',
        data: JSON.stringify({
          requestId,
          companyName: request.company.name,
          buyerName: request.buyer.name,
          stat: request.stat,
          quantity: request.quantity,
          reason,
          rejectedBy: req.admin.id
        }),
        source: 'admin',
        userId: req.admin.id
      }
    });
    
    res.json({
      success: true,
      data: updatedRequest
    });
    
  } catch (error) {
    console.error('Reject training request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject training request'
    });
  }
});

// =============================================================================
// ADMIN ANALYTICS ENDPOINTS
// =============================================================================

/**
 * Get admin overview analytics
 * @route GET /analytics/overview
 * @description Returns high-level statistics across all companies
 * @returns {Object} Analytics overview
 */
router.get('/analytics/overview', async (req, res) => {
  try {
    const [
      totalCompanies,
      totalEmployees,
      totalTrainsPurchased,
      pendingRequests,
      approvedRequests,
      completedTraining,
      recentActivity
    ] = await Promise.all([
      // Total companies
      prisma.company.count({ where: { isActive: true } }),
      
      // Total employees across all companies
      prisma.user.count({ 
        where: { 
          companyId: { not: null },
          isActive: true
        }
      }),
      
      // Total trains purchased across all companies
      prisma.purchase.aggregate({
        _sum: { trainsPurchased: true }
      }),
      
      // Pending training requests
      prisma.trainingRequest.count({
        where: { status: 'pending' }
      }),
      
      // Approved requests in last 30 days
      prisma.trainingRequest.count({
        where: {
          status: 'approved',
          approvedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Completed training in last 30 days
      prisma.trainingSession.count({
        where: {
          type: 'training_completed',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Recent activity (last 10 system logs)
      prisma.systemLog.findMany({
        where: { source: 'admin' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          message: true,
          createdAt: true,
          level: true
        }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalCompanies,
          totalEmployees,
          totalTrainsPurchased: totalTrainsPurchased._sum.trainsPurchased || 0,
          pendingRequests,
          approvedRequests,
          completedTraining
        },
        recentActivity,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics overview'
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
