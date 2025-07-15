#!/usr/bin/env node

/**
 * Enhanced Smart Database Setup Script
 * Supports the new enhanced schema with detailed company tracking
 * 
 * @file backend/scripts/setup-database.js
 * @author Training Company App
 * @version 3.0.0 (Enhanced Schema Support)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Console logging with consistent prefixes
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
 * Update only the datasource provider in existing schema
 */
function updateSchemaProvider(provider) {
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    log('Schema file does not exist, creating enhanced schema', 'warn');
    createEnhancedSchema(provider);
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
      log('Could not find datasource provider in schema, creating enhanced schema', 'warn');
      createEnhancedSchema(provider);
    }
    
  } catch (error) {
    log(`Error updating schema provider: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Create complete enhanced schema with all models for detailed company tracking
 */
function createEnhancedSchema(provider) {
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  const enhancedSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
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
  
  // Company relations
  ownedCompany    Company? @relation("CompanyOwner")
  employeeOf      Company? @relation("CompanyEmployee", fields: [companyId], references: [id])
  companyId       String?
  
  // Company role: "director", "employee", "trains_buyer"
  companyRole     String?
  
  // Existing relations
  training           Training[]
  sessions           TrainingSession[]
  trainingRequests   TrainingRequest[] @relation("RequestedBy")
  
  // New relations for detailed tracking
  employeeDetails    EmployeeDetails?
  trainingLogs       TrainingLog[] @relation("TrainedEmployee")
  
  @@map("users")
}

model Company {
  id          String   @id @default(cuid())
  tornId      Int      @unique  // Company ID from Torn API
  name        String
  companyType Int      // Company type number from Torn API
  ownerId     String   @unique // References User.id (director)
  
  // Company settings
  hasTCP      Boolean  @default(false)  // Toggle for TCP availability
  hasTGP      Boolean  @default(false)  // Toggle for TGP availability
  advertising String?  // "390k per train", etc.
  
  // Company resources (from Torn API) - Using String for BigInt values to avoid SQLite issues
  trainsAvailable Int?     // Current trains in company
  companyBank     String?  // Company cash as string (was BigInt)
  companyFunds    String?  // Same as bank but keeping both for API compatibility (was BigInt)
  popularity      Int?     // Company popularity
  efficiency      Int?     // Company efficiency
  environment     Int?     // Company environment
  value           String?  // Company total value as string (was companyValue BigInt)
  
  // Company performance metrics
  dailyIncome     Int?     // Daily income
  dailyCustomers  Int?     // Daily customers
  weeklyIncome    Int?     // Weekly income
  weeklyCustomers Int?     // Weekly customers
  employeesHired  Int?     // Current employee count
  employeesCapacity Int?   // Maximum employees
  daysOld         Int?     // Company age in days
  rating          Int?     // Company rating
  
  // Company upgrades
  companySize     Int?     // Company size upgrade level
  staffroomSize   String?  // Staff room description
  storageSize     String?  // Storage room description
  storageSpace    Int?     // Storage space available
  advertisingBudget String? // Advertising budget as string (was BigInt)
  
  // Metadata
  isActive    Boolean  @default(true)
  lastSynced  DateTime? // Last time we synced with Torn API
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  owner          User               @relation("CompanyOwner", fields: [ownerId], references: [id])
  employees      User[]             @relation("CompanyEmployee")
  purchases      Purchase[]
  trainingRequests TrainingRequest[]
  employeeDetails EmployeeDetails[]
  trainingLogs   TrainingLog[]
  companyNews    CompanyNews[]
  
  @@map("companies")
}

model EmployeeDetails {
  id          String   @id @default(cuid())
  userId      String   @unique
  companyId   String
  
  // Employee info from Torn API
  position    String   // "Bartender", "Manager", "Director", etc.
  daysInCompany Int    // Days working at company
  wage        Int      @default(0)
  
  // Work stats
  manualLabor   Int     @default(0)
  intelligence  Int     @default(0)
  endurance     Int     @default(0)
  
  // Effectiveness breakdown
  workingStats       Int @default(0)  // Base effectiveness from stats
  settledIn         Int @default(0)   // Settled in bonus
  directorEducation Int @default(0)   // Director education bonus
  merits            Int @default(0)   // Merit bonuses
  addiction         Int @default(0)   // Addiction penalty (negative)
  totalEffectiveness Int @default(0)  // Total effectiveness
  
  // Status tracking
  lastActionStatus    String?  // "Online", "Offline", "Idle"
  lastActionTimestamp Int?     // Unix timestamp
  lastActionRelative  String?  // "2 hours ago"
  statusDescription   String?  // "Okay", "Traveling to Switzerland"
  statusDetails       String?  // Additional status info
  statusState         String?  // "Okay", "Traveling", etc.
  statusColor         String?  // "green", "blue", etc.
  statusUntil         Int?     // Status expiry timestamp
  
  // Metadata
  lastUpdated DateTime @default(now())
  createdAt   DateTime @default(now())
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@map("employee_details")
}

model TrainingLog {
  id          String   @id @default(cuid())
  companyId   String
  trainedById String   // User ID of the employee who was trained
  
  // Training event details
  eventId     String   @unique // The unique key from Torn API news
  timestamp   Int      // Unix timestamp from API
  position    String   // Employee position when trained
  
  // Stat gains (if we can determine them)
  manualLaborGained Int @default(0)
  intelligenceGained Int @default(0)
  enduranceGained   Int @default(0)
  
  // Metadata
  createdAt   DateTime @default(now())
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  trainedBy   User     @relation("TrainedEmployee", fields: [trainedById], references: [id])
  
  @@map("training_logs")
}

model CompanyNews {
  id          String   @id @default(cuid())
  companyId   String
  
  // News details from API
  newsId      String   @unique // The unique key from API
  newsText    String   // The news content
  timestamp   Int      // Unix timestamp
  newsType    String   // "training", "daily_report", "other"
  
  // Parsed data (if it's a training event)
  employeeId  Int?     // Torn ID of employee (extracted from news)
  employeeName String? // Employee name (extracted from news)
  position    String?  // Position (extracted from news)
  
  // Metadata
  createdAt   DateTime @default(now())
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@map("company_news")
}

model Purchase {
  id              String   @id @default(cuid())
  companyId       String
  trainsPurchased Int      // Manual entry by admin
  purchaseDate    DateTime @default(now())
  notes           String?  // Optional notes about the purchase
  purchasedBy     String   // Admin user ID who recorded this
  
  // Relations
  company         Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@map("purchases")
}

model TrainingRequest {
  id           String   @id @default(cuid())
  companyId    String
  requestedBy  String   // User ID of trains buyer
  stat         String   // "Manual Labor", "Intelligence", "Endurance"
  quantity     Int      // Number of trains requested
  targetLevel  Int?     // Optional target level
  notes        String?  // Request notes
  
  // Status tracking
  status       String   @default("pending") // "pending", "approved", "rejected", "completed"
  approvedBy   String?  // Admin user ID
  approvedAt   DateTime?
  
  // Payment tracking
  paymentReceived Boolean @default(false)
  paymentAmount   Float?
  paymentDate     DateTime?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  company      Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  buyer        User     @relation("RequestedBy", fields: [requestedBy], references: [id])
  
  @@map("training_requests")
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

model SystemLog {
  id        String   @id @default(cuid())
  level     String   // "info", "warn", "error", "debug"
  message   String
  data      String?  // JSON string for additional data
  source    String   // "api", "admin", "system", etc.
  userId    String?  // Optional user ID if action is user-related
  createdAt DateTime @default(now())
  
  @@map("system_logs")
}
`;

  fs.writeFileSync(schemaPath, enhancedSchema);
  log(`Created enhanced schema with ${provider} provider`, 'success');
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
    execCommand('npx prisma migrate dev --name enhanced_schema_init --skip-generate', 'Creating enhanced schema migration');
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
}

/**
 * Main setup function
 */
function setupDatabase(environment) {
  log(`Starting enhanced database setup for ${environment}`, 'info');
  log(`Node.js: ${process.version}`, 'info');
  log(`Working directory: ${process.cwd()}`, 'info');
  
  try {
    // Step 1: Update schema provider only (preserve existing schema)
    updateSchemaProvider(environment);
    
    // Step 2: Set up database based on environment
    if (environment === 'postgresql') {
      setupPostgreSQLDatabase();
    } else if (environment === 'sqlite') {
      setupSQLiteDatabase();
    } else {
      throw new Error(`Unsupported environment: ${environment}`);
    }
    
    // Step 3: Generate Prisma client
    execCommand('npx prisma generate', 'Generating enhanced Prisma client');
    
    // Step 4: Seed database with enhanced data
    execCommand('npx prisma db seed', 'Seeding enhanced database', true);
    
    log('Enhanced database setup completed successfully!', 'success');
    
  } catch (error) {
    log(`Enhanced database setup failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  log('Enhanced Smart Database Setup v3.0.0', 'info');
  log('======================================', 'info');
  
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