/**
 * @fileoverview User management service
 * @description Handles user registration, authentication, and data management
 * @version 1.0.0
 */

const { prisma } = require('./database');
const { encrypt, decrypt } = require('./encryption');
const tornAPI = require('./tornAPI');

/**
 * User service class
 * @class UserService
 */
class UserService {
  /**
   * Verify API key with Torn and create/update user
   * @async
   * @function verifyAndCreateUser
   * @param {string} apiKey - Torn API key to verify
   * @returns {Promise<Object>} Result object with success status and user data
   */
  async verifyAndCreateUser(apiKey) {
    try {
      console.log('Verifying API key and user registration...');
      
      // Verify API key with Torn API
      const tornData = await tornAPI.verifyAPIKey(apiKey);
      
      const tornId = parseInt(tornData.player_id);
      const name = tornData.name;
      
      console.log(`API key verified for user: ${name} [${tornId}]`);

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { tornId }
      });

      if (user) {
        console.log('Existing user found, updating API key...');
        
        // Update existing user's API key and info
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            apiKey: encrypt(apiKey),
            name: name,
            isActive: true,
            updatedAt: new Date()
          }
        });
        
        // Log the API key update
        await prisma.trainingSession.create({
          data: {
            userId: user.id,
            type: 'api_key_updated',
            notes: `API key updated for ${name} [${tornId}]`
          }
        });
        
      } else {
        console.log('New user, creating account...');
        
        // Create new user
        user = await prisma.user.create({
          data: {
            tornId,
            name,
            apiKey: encrypt(apiKey),
            isActive: true
          }
        });

        // Create initial training record
        await prisma.training.create({
          data: {
            userId: user.id,
            currentStat: 'Not Assigned',
            trainsRemaining: 0,
            notes: 'New user - awaiting training assignment'
          }
        });

        // Log user creation
        await prisma.trainingSession.create({
          data: {
            userId: user.id,
            type: 'user_registered',
            notes: `New user registered: ${name} [${tornId}]`
          }
        });
        
        // Log to system log
        await prisma.systemLog.create({
          data: {
            level: 'info',
            message: 'New user registered',
            data: JSON.stringify({ tornId, name }),
            source: 'api',
            userId: user.id
          }
        });
        
        console.log('New user created successfully');
      }

      return {
        success: true,
        user: {
          id: user.id,
          tornId: user.tornId,
          name: user.name,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      };

    } catch (error) {
      console.error('User verification error:', error.message);
      
      // Log failed attempts
      await prisma.systemLog.create({
        data: {
          level: 'warn',
          message: 'User verification failed',
          data: JSON.stringify({ error: error.message }),
          source: 'api'
        }
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's training data
   * @async
   * @function getUserTrainingData
   * @param {number} tornId - Torn user ID
   * @returns {Promise<Object>} User and training data
   * @throws {Error} If user not found
   */
  async getUserTrainingData(tornId) {
    const user = await prisma.user.findUnique({
      where: { tornId: parseInt(tornId) },
      include: {
        training: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    const training = user.training[0];
    
    return {
      user: {
        id: user.id,
        tornId: user.tornId,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      training: training || {
        currentStat: 'Not Assigned',
        trainsRemaining: 0,
        targetLevel: null,
        notes: 'No training assignment'
      }
    };
  }

  /**
   * Get current work stats from Torn API
   * @async
   * @function getCurrentWorkStats
   * @param {number} tornId - Torn user ID
   * @returns {Promise<Object|null>} Work stats or null if error
   */
  async getCurrentWorkStats(tornId) {
    try {
      const user = await prisma.user.findUnique({
        where: { tornId: parseInt(tornId) }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const apiKey = decrypt(user.apiKey);
      const stats = await tornAPI.getUserWorkStats(apiKey);

      // Log stats retrieval
      await prisma.trainingSession.create({
        data: {
          userId: user.id,
          type: 'stats_retrieved',
          details: JSON.stringify(stats),
          notes: 'Work stats retrieved from Torn API'
        }
      });

      return stats;
      
    } catch (error) {
      console.error('Error fetching work stats:', error.message);
      
      // Log error
      await prisma.systemLog.create({
        data: {
          level: 'error',
          message: 'Failed to retrieve work stats',
          data: JSON.stringify({ tornId, error: error.message }),
          source: 'api'
        }
      });
      
      return null;
    }
  }

  /**
   * Get user by ID
   * @async
   * @function getUserById
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User data or null if not found
   */
  async getUserById(userId) {
    try {
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

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        tornId: user.tornId,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        training: user.training[0] || null
      };
      
    } catch (error) {
      console.error('Error getting user by ID:', error.message);
      return null;
    }
  }

  /**
   * Test user service functionality
   * @async
   * @function testService
   * @returns {Promise<boolean>} True if tests pass
   */
  async testService() {
    try {
      console.log('Testing user service...');
      
      // Test database connectivity
      const userCount = await prisma.user.count();
      console.log(`User service test: Found ${userCount} users in database`);
      
      // Test encryption service
      const { testEncryption } = require('./encryption');
      const encryptionTest = testEncryption();
      
      if (!encryptionTest) {
        throw new Error('Encryption test failed');
      }
      
      console.log('User service test: PASSED');
      return true;
      
    } catch (error) {
      console.error('User service test: FAILED -', error.message);
      return false;
    }
  }
}

/**
 * Singleton instance of UserService
 * @type {UserService}
 */
const userService = new UserService();

module.exports = userService;
