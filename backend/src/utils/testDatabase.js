/**
 * @fileoverview Database connection test utility
 * @description Tests database connectivity and basic operations
 * @version 1.0.0
 */

const { prisma, testConnection } = require('../services/database');

/**
 * Test database operations
 * @async
 * @function testDatabaseOperations
 * @description Performs basic database tests to verify setup
 */
async function testDatabaseOperations() {
  console.log('Testing database operations...');
  
  try {
    // Test connection
    await testConnection();
    
    // Test basic query
    const userCount = await prisma.user.count();
    const adminCount = await prisma.adminUser.count();
    const trainingCount = await prisma.training.count();
    
    console.log('Database statistics:');
    console.log(`Users: ${userCount}`);
    console.log(`Admin users: ${adminCount}`);
    console.log(`Training assignments: ${trainingCount}`);
    
    // Test log creation
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'Database test completed successfully',
        source: 'test'
      }
    });
    
    console.log('Database test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('Database test failed:', error.message);
    return false;
  }
}

// Run test if called directly
if (require.main === module) {
  testDatabaseOperations()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseOperations };
