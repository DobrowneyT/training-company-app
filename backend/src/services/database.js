/**
 * @fileoverview Database service using Prisma Client
 * @description Provides centralized database access and connection management
 * @version 1.0.0
 */

const { PrismaClient } = require('@prisma/client');

/**
 * Prisma client configuration options
 * @type {Object}
 */
const prismaOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
  errorFormat: 'pretty',
};

/**
 * Prisma client instance
 * @type {PrismaClient}
 */
const prisma = new PrismaClient(prismaOptions);

/**
 * Test database connection
 * @async
 * @function testConnection
 * @returns {Promise<boolean>} True if connection successful
 * @throws {Error} If connection fails
 */
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Gracefully disconnect from database
 * @async
 * @function disconnect
 * @returns {Promise<void>}
 */
async function disconnect() {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from database:', error.message);
  }
}

/**
 * Handle graceful shutdown on process termination
 */
process.on('beforeExit', async () => {
  console.log('Process ending, disconnecting from database...');
  await disconnect();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, disconnecting from database...');
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, disconnecting from database...');
  await disconnect();
  process.exit(0);
});

module.exports = {
  prisma,
  testConnection,
  disconnect
};
