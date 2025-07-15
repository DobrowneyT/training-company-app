#!/usr/bin/env node

/**
 * Intelligent Database Setup Script
 * Only runs seed when database is truly empty to prevent conflicts
 * 
 * @file backend/scripts/setup-database.js
 * @author Training Company App
 * @version 4.0.0 (Intelligent Seeding)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Console logging with consistent prefixes
 * @param {string} message - Message to log
 * @param {string} type - Log type (info, success, error, warn, setup)
 */
function log(message, type = 'info') {
  const prefixes = {
    info: 'INFO:',
    success: 'SUCCESS:',
    error: 'ERROR:',
    warn: 'WARN:',
    setup: 'SETUP:'
  };
  
  const prefix = prefixes[type] || prefixes.info;
  console.log(`${prefix} ${message}`);
}

/**
 * Execute shell command with error handling
 * @param {string} command - Command to execute
 * @param {string} description - Description for logging
 * @param {boolean} allowFailure - Whether to continue on failure
 * @returns {boolean} Success status
 */
function execCommand(command, description, allowFailure = false) {
  try {
    log(`${description}...`, 'setup');
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    log(`${description} completed successfully`, 'success');
    return true;
  } catch (error) {
    if (allowFailure) {
      log(`${description} failed (continuing): ${error.message}`, 'warn');
      return false;
    } else {
      log(`${description} failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

/**
 * Detect database environment
 * @returns {string} Database type (postgresql, sqlite, unknown)
 */
function detectEnvironment() {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  log(`DATABASE_URL: ${databaseUrl ? '[SET]' : '[NOT SET]'}`, 'info');
  
  if (databaseUrl.includes('postgresql://') || databaseUrl.includes('postgres://')) {
    return 'postgresql';
  } else if (databaseUrl.includes('file:') || databaseUrl.includes('.db') || databaseUrl.includes('sqlite:')) {
    return 'sqlite';
  } else if (!databaseUrl) {
    return 'sqlite';
  }
  
  return 'unknown';
}

/**
 * Check if database is empty by looking for admin users
 * @returns {Promise<boolean>} True if database is empty
 */
async function isDatabaseEmpty() {
  try {
    // Try to connect to database and check for admin users
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const adminCount = await prisma.adminUser.count();
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    const isEmpty = adminCount === 0 && userCount === 0;
    log(`Database check: ${isEmpty ? 'EMPTY' : 'HAS DATA'} (${adminCount} admins, ${userCount} users)`, 'info');
    
    return isEmpty;
  } catch (error) {
    // If we can't connect or tables don't exist, assume it's empty
    log(`Database check failed (assuming empty): ${error.message}`, 'warn');
    return true;
  }
}

/**
 * Update only the datasource provider in existing schema
 * @param {string} provider - Database provider (sqlite, postgresql)
 */
function updateSchemaProvider(provider) {
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    log('Schema file does not exist, will be created during migration', 'warn');
    return;
  }
  
  try {
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // More specific regex to target only datasource provider
    const datasourceProviderRegex = /(datasource\s+db\s*{[^}]*provider\s*=\s*")([^"]+)(")/s;
    const currentProviderMatch = schemaContent.match(datasourceProviderRegex);
    
    if (currentProviderMatch && currentProviderMatch[2] === provider) {
      log(`Schema already configured for ${provider}`, 'info');
      return;
    }
    
    if (currentProviderMatch) {
      // Update only the datasource provider line
      schemaContent = schemaContent.replace(
        datasourceProviderRegex,
        `$1${provider}$3`
      );
      
      fs.writeFileSync(schemaPath, schemaContent);
      log(`Updated datasource provider to ${provider}`, 'success');
    } else {
      log('Could not find datasource provider in schema', 'warn');
    }
    
  } catch (error) {
    log(`Error updating schema provider: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Clean up migrations if switching database providers
 * @param {string} targetProvider - Target database provider
 * @returns {boolean} True if cleanup was performed
 */
function cleanupIncompatibleMigrations(targetProvider) {
  const migrationsDir = path.join(__dirname, '../prisma/migrations');
  const lockFilePath = path.join(migrationsDir, 'migration_lock.toml');
  
  if (!fs.existsSync(lockFilePath)) {
    return false; // No migrations to clean up
  }
  
  try {
    const lockContent = fs.readFileSync(lockFilePath, 'utf8');
    const needsCleanup = (
      (targetProvider === 'postgresql' && lockContent.includes('provider = "sqlite"')) ||
      (targetProvider === 'sqlite' && lockContent.includes('provider = "postgresql"'))
    );
    
    if (needsCleanup) {
      log('Removing incompatible migration files', 'warn');
      execCommand(`rm -rf "${migrationsDir}"`, 'Cleaning migrations directory', true);
      return true;
    }
  } catch (error) {
    log(`Error reading migration lock file: ${error.message}`, 'warn');
  }
  
  return false;
}

/**
 * Set up SQLite database (local development)
 * @param {boolean} shouldSeed - Whether to run seed after setup
 */
function setupSQLiteDatabase(shouldSeed) {
  log('Setting up SQLite database for local development', 'info');
  
  // Set default DATABASE_URL if not provided
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db';
    log('Set DATABASE_URL to file:./dev.db', 'info');
  }
  
  // Create or apply migrations
  const migrationsDir = path.join(__dirname, '../prisma/migrations');
  if (!fs.existsSync(migrationsDir) || fs.readdirSync(migrationsDir).length === 0) {
    execCommand('npx prisma migrate dev --name enhanced_schema_init --skip-generate', 'Creating enhanced schema migration');
  } else {
    execCommand('npx prisma migrate deploy', 'Applying existing migrations');
  }
  
  // Generate client
  execCommand('npx prisma generate', 'Generating Prisma client');
  
  // Seed only if database is empty and seeding is requested
  if (shouldSeed) {
    execCommand('npx prisma db seed', 'Seeding database with initial data', true);
  } else {
    log('Skipping seed - database already has data', 'info');
  }
}

/**
 * Set up PostgreSQL database (production)
 * @param {boolean} shouldSeed - Whether to run seed after setup
 */
function setupPostgreSQLDatabase(shouldSeed) {
  log('Setting up PostgreSQL database for production', 'info');
  
  // Clean up incompatible migrations
  cleanupIncompatibleMigrations('postgresql');
  
  // Try different approaches in order of preference
  const approaches = [
    {
      command: 'npx prisma migrate deploy',
      description: 'Deploying migrations'
    },
    {
      command: 'npx prisma db push',
      description: 'Pushing enhanced schema directly'
    }
  ];
  
  let success = false;
  for (const approach of approaches) {
    if (execCommand(approach.command, approach.description, true)) {
      success = true;
      break;
    }
  }
  
  if (!success) {
    throw new Error('All database setup approaches failed');
  }
  
  // Generate client
  execCommand('npx prisma generate', 'Generating Prisma client');
  
  // Seed only if database is empty and seeding is requested
  if (shouldSeed) {
    execCommand('npx prisma db seed', 'Seeding database with initial data', true);
  } else {
    log('Skipping seed - database already has data', 'info');
  }
}

/**
 * Main setup function
 * @param {string} environment - Database environment
 */
async function setupDatabase(environment) {
  log(`Starting intelligent database setup for ${environment}`, 'info');
  log(`Node.js: ${process.version}`, 'info');
  log(`Working directory: ${process.cwd()}`, 'info');
  
  try {
    // Step 1: Update schema provider only
    updateSchemaProvider(environment);
    
    // Step 2: Check if database is empty
    const isEmpty = await isDatabaseEmpty();
    
    // Step 3: Set up database based on environment
    if (environment === 'postgresql') {
      setupPostgreSQLDatabase(isEmpty);
    } else if (environment === 'sqlite') {
      setupSQLiteDatabase(isEmpty);
    } else {
      throw new Error(`Unsupported environment: ${environment}`);
    }
    
    log('Intelligent database setup completed successfully!', 'success');
    
  } catch (error) {
    log(`Database setup failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  log('Intelligent Database Setup v4.0.0', 'info');
  log('====================================', 'info');
  
  const environment = detectEnvironment();
  
  if (environment === 'unknown') {
    log('Could not detect database environment', 'error');
    process.exit(1);
  }
  
  await setupDatabase(environment);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { detectEnvironment, setupDatabase };