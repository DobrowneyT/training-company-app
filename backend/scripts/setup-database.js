#!/usr/bin/env node

/**
 * Fixed Smart Database Setup Script
 * Simplified and more reliable schema updating
 * 
 * @file backend/scripts/setup-database.js
 * @author Training Company App
 * @version 1.1.0 (Fixed)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Console logging with emoji prefixes
 */
function log(message, type = 'info') {
  const prefixes = {
    info: '🗄️ ',
    success: '✅ ',
    error: '❌ ',
    warn: '⚠️ ',
    setup: '🔧 '
  };
  
  const prefix = prefixes[type] || prefixes.info;
  console.log(`${prefix}${message}`);
}

/**
 * Execute shell command with error handling
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
 * Create the appropriate Prisma schema for the environment
 */
function createPrismaSchema(provider) {
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  // Define the complete schema with the correct provider
  const schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  tornId      Int      @unique
  name        String
  apiKey      String   // Encrypted
  discordId   String?  @unique
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  training    Training[]
  sessions    TrainingSession[]
  
  @@map("users")
}

model Training {
  id              String   @id @default(cuid())
  userId          String
  currentStat     String   // "Manual Labor", "Intelligence", "Endurance", "Not Assigned"
  trainsRemaining Int      @default(0)
  targetLevel     Int?
  notes           String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions        TrainingSession[]
  
  @@map("training")
}

model TrainingSession {
  id        String   @id @default(cuid())
  userId    String
  trainingId String?
  type      String   // "completed", "payment_received", "assignment_created", "stats_updated"
  details   String?  // JSON string for additional data
  notes     String?
  createdAt DateTime @default(now())
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  training  Training? @relation(fields: [trainingId], references: [id], onDelete: SetNull)
  
  @@map("training_sessions")
}

model AdminUser {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?  @unique
  password  String   // Hashed with bcrypt
  discordId String?  @unique
  role      String   @default("admin")
  isActive  Boolean  @default(true)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("admin_users")
}
`;

  // Write the complete schema with correct provider
  fs.writeFileSync(schemaPath, schemaContent);
  log(`Created Prisma schema with ${provider} provider`, 'success');
}

/**
 * Clean up migrations if switching database providers
 */
function cleanupIncompatibleMigrations(targetProvider) {
  const migrationsDir = path.join(__dirname, '../prisma/migrations');
  const lockFilePath = path.join(migrationsDir, 'migration_lock.toml');
  
  if (!fs.existsSync(lockFilePath)) {
    return false; // No migrations to clean up
  }
  
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
  
  return false;
}

/**
 * Set up SQLite database (local development)
 */
function setupSQLiteDatabase() {
  log('Setting up SQLite database for local development', 'info');
  
  // Set default DATABASE_URL if not provided
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db';
    log('Set DATABASE_URL to file:./dev.db', 'info');
  }
  
  // Create or apply migrations
  const migrationsDir = path.join(__dirname, '../prisma/migrations');
  if (!fs.existsSync(migrationsDir) || fs.readdirSync(migrationsDir).length === 0) {
    execCommand('npx prisma migrate dev --name init --skip-generate', 'Creating initial migration');
  } else {
    execCommand('npx prisma migrate deploy', 'Applying existing migrations');
  }
}

/**
 * Set up PostgreSQL database (production)
 */
function setupPostgreSQLDatabase() {
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
      description: 'Pushing schema directly'
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
}

/**
 * Main setup function
 */
function setupDatabase(environment) {
  log(`Starting database setup for ${environment}`, 'info');
  log(`Node.js: ${process.version}`, 'info');
  log(`Working directory: ${process.cwd()}`, 'info');
  
  try {
    // Step 1: Create correct schema for environment
    createPrismaSchema(environment);
    
    // Step 2: Set up database based on environment
    if (environment === 'postgresql') {
      setupPostgreSQLDatabase();
    } else if (environment === 'sqlite') {
      setupSQLiteDatabase();
    } else {
      throw new Error(`Unsupported environment: ${environment}`);
    }
    
    // Step 3: Generate Prisma client
    execCommand('npx prisma generate', 'Generating Prisma client');
    
    // Step 4: Seed database (optional)
    execCommand('npx prisma db seed', 'Seeding database', true);
    
    log('Database setup completed successfully!', 'success');
    
  } catch (error) {
    log(`Database setup failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  log('Smart Database Setup v1.1.0', 'info');
  log('================================', 'info');
  
  const environment = detectEnvironment();
  
  if (environment === 'unknown') {
    log('Could not detect database environment', 'error');
    process.exit(1);
  }
  
  setupDatabase(environment);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { detectEnvironment, setupDatabase };