/**
 * @fileoverview Admin management service
 * @description Handles admin authentication, user management, and training assignments
 * @version 1.0.0
 */

const bcrypt = require('bcryptjs');
const { prisma } = require('./database');
const { generateToken } = require('../middleware/auth');

/**
 * Admin service class
 * @class AdminService
 */
class AdminService {
  /**
   * Create new admin user
   * @async
   * @function createAdmin
   * @param {Object} adminData - Admin user data
   * @param {string} adminData.username - Username
   * @param {string} adminData.password - Plain text password
   * @param {string} [adminData.email] - Email address
   * @param {string} [adminData.role] - Admin role
   * @returns {Promise<Object>} Created admin user
   * @throws {Error} If creation fails
   */
  async createAdmin(adminData) {
    const { username, password, email = null, role = 'admin' } = adminData;
    
    // Validate input
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // Check if username already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username }
    });
    
    if (existingAdmin) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role
      }
    });
    
    // Log admin creation
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'New admin user created',
        data: JSON.stringify({ 
          adminId: admin.id, 
          username: admin.username,
          role: admin.role 
        }),
        source: 'admin'
      }
    });
    
    console.log(`Admin user created: ${username} [${admin.id}]`);
    
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt
    };
  }

  /**
   * Authenticate admin user
   * @async
   * @function authenticateAdmin
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Authentication result with token
   * @throws {Error} If authentication fails
   */
  async authenticateAdmin(username, password) {
    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role
    });

    // Log successful login
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'Admin user logged in',
        data: JSON.stringify({ 
          adminId: admin.id, 
          username: admin.username 
        }),
        source: 'admin'
      }
    });

    console.log(`Admin login successful: ${username} [${admin.id}]`);

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    };
  }

  /**
   * Get all users with training data
   * @async
   * @function getAllUsers
   * @returns {Promise<Array>} Array of users with training data
   */
  async getAllUsers() {
    const users = await prisma.user.findMany({
      include: {
        training: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => ({
      id: user.id,
      tornId: user.tornId,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      training: user.training[0] || {
        currentStat: 'Not Assigned',
        trainsRemaining: 0,
        targetLevel: null,
        notes: 'No training assignment'
      },
      recentSessions: user.sessions.map(session => ({
        type: session.type,
        notes: session.notes,
        createdAt: session.createdAt
      }))
    }));
  }

  /**
   * Assign training to user
   * @async
   * @function assignTraining
   * @param {string} userId - User ID
   * @param {Object} trainingData - Training assignment data
   * @param {string} trainingData.currentStat - Stat to train
   * @param {number} trainingData.trainsRemaining - Number of sessions
   * @param {number} [trainingData.targetLevel] - Target level
   * @param {string} [trainingData.notes] - Assignment notes
   * @param {string} adminId - ID of admin making assignment
   * @returns {Promise<Object>} Created training assignment
   * @throws {Error} If assignment fails
   */
  async assignTraining(userId, trainingData, adminId) {
    const { currentStat, trainsRemaining, targetLevel, notes } = trainingData;

    // Validate input
    if (!['Manual Labor', 'Intelligence', 'Endurance'].includes(currentStat)) {
      throw new Error('Invalid stat type');
    }

    if (!Number.isInteger(trainsRemaining) || trainsRemaining < 0) {
      throw new Error('Trains remaining must be a non-negative integer');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Deactivate current training assignments
    await prisma.training.updateMany({
      where: { 
        userId, 
        isActive: true 
      },
      data: { isActive: false }
    });

    // Create new training assignment
    const training = await prisma.training.create({
      data: {
        userId,
        currentStat,
        trainsRemaining: parseInt(trainsRemaining),
        targetLevel: targetLevel ? parseInt(targetLevel) : null,
        notes
      }
    });

    // Log the assignment
    await prisma.trainingSession.create({
      data: {
        userId,
        trainingId: training.id,
        type: 'assignment_created',
        notes: `Assigned ${currentStat} training: ${trainsRemaining} sessions`
      }
    });

    // Log to system log
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'Training assignment created',
        data: JSON.stringify({
          userId,
          userName: user.name,
          currentStat,
          trainsRemaining,
          targetLevel,
          assignedBy: adminId
        }),
        source: 'admin',
        userId: adminId
      }
    });

    console.log(`Training assigned: ${user.name} -> ${currentStat} (${trainsRemaining} sessions)`);

    return training;
  }

  /**
   * Update training progress
   * @async
   * @function updateTrainingProgress
   * @param {string} userId - User ID
   * @param {number} [decrement=1] - Number of sessions to subtract
   * @param {string} adminId - ID of admin making update
   * @returns {Promise<Object>} Updated training data
   * @throws {Error} If update fails
   */
  async updateTrainingProgress(userId, decrement = 1, adminId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        training: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user || !user.training[0]) {
      throw new Error('No active training found for user');
    }

    const training = user.training[0];
    const newTrainsRemaining = Math.max(0, training.trainsRemaining - decrement);

    // Update training progress
    const updatedTraining = await prisma.training.update({
      where: { id: training.id },
      data: { 
        trainsRemaining: newTrainsRemaining,
        updatedAt: new Date()
      }
    });

    // Log the progress update
    await prisma.trainingSession.create({
      data: {
        userId,
        trainingId: training.id,
        type: 'training_completed',
        notes: `Completed ${decrement} training session(s). Remaining: ${newTrainsRemaining}`
      }
    });

    // Log to system log
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'Training progress updated',
        data: JSON.stringify({
          userId,
          userName: user.name,
          sessionsCompleted: decrement,
          remaining: newTrainsRemaining,
          updatedBy: adminId
        }),
        source: 'admin',
        userId: adminId
      }
    });

    console.log(`Training progress updated: ${user.name} -> ${newTrainsRemaining} remaining`);

    return { 
      trainsRemaining: newTrainsRemaining,
      completed: newTrainsRemaining === 0
    };
  }

  /**
   * Get admin dashboard statistics
   * @async
   * @function getAdminStats
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getAdminStats() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      activeTraining,
      pendingAssignment,
      completedTraining,
      totalSessions,
      recentSessions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.training.count({
        where: { 
          isActive: true,
          currentStat: { not: 'Not Assigned' },
          trainsRemaining: { gt: 0 }
        }
      }),
      prisma.training.count({
        where: { 
          isActive: true,
          currentStat: 'Not Assigned'
        }
      }),
      prisma.training.count({
        where: { 
          isActive: true,
          trainsRemaining: 0,
          currentStat: { not: 'Not Assigned' }
        }
      }),
      prisma.trainingSession.count(),
      prisma.trainingSession.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers
      },
      training: {
        active: activeTraining,
        pending: pendingAssignment,
        completed: completedTraining
      },
      sessions: {
        total: totalSessions,
        recent: recentSessions
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Test admin service functionality
   * @async
   * @function testService
   * @returns {Promise<boolean>} True if tests pass
   */
  async testService() {
    try {
      console.log('Testing admin service...');
      
      // Test database connectivity
      const adminCount = await prisma.adminUser.count();
      console.log(`Admin service test: Found ${adminCount} admin users in database`);
      
      // Test bcrypt functionality
      const testPassword = 'test123';
      const hashed = await bcrypt.hash(testPassword, 12);
      const isValid = await bcrypt.compare(testPassword, hashed);
      
      if (!isValid) {
        throw new Error('Bcrypt test failed');
      }
      
      console.log('Admin service test: PASSED');
      return true;
      
    } catch (error) {
      console.error('Admin service test: FAILED -', error.message);
      return false;
    }
  }
}

/**
 * Singleton instance of AdminService
 * @type {AdminService}
 */
const adminService = new AdminService();

module.exports = adminService;
