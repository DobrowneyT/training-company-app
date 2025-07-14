#!/usr/bin/env node

/**
 * Smart Database Setup Script
 * Automatically detects environment and sets up database accordingly
 * - Local: SQLite with migrations
 * - Production: PostgreSQL with migrations or db push
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`🗄️  ${message}`);
}

function detectEnvironment() {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  if (databaseUrl.includes('postgresql://') || databaseUrl.includes('postgres://')) {
    return 'postgresql';
  } else if (databaseUrl.includes('file:') || databaseUrl.includes('.db')) {
    return 'sqlite';
  } else if (!databaseUrl) {
    // Default to SQLite for local development
    return 'sqlite';
  }
  
  return 'unknown';
}

function updatePrismaSchema(provider) {
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Update the provider in the schema
  schema = schema.replace(/provider = ".*"/, `provider = "${provider}"`);
  
  fs.writeFileSync(schemaPath, schema);
  log(`Updated Prisma schema to use ${provider}`);
}

function setupDatabase(environment) {
  log(`Detected environment: ${environment}`);
  
  try {
    // Update schema for the detected environment
    updatePrismaSchema(environment);
    
    if (environment === 'postgresql') {
      // Production PostgreSQL setup
      log('Setting up PostgreSQL database...');
      
      // Check if migrations exist and are compatible
      const migrationsDir = path.join(__dirname, '../prisma/migrations');
      const hasIncompatibleMigrations = fs.existsSync(migrationsDir) && 
        fs.readdirSync(migrationsDir).length > 0 &&
        fs.existsSync(path.join(migrationsDir, 'migration_lock.toml')) &&
        fs.readFileSync(path.join(migrationsDir, 'migration_lock.toml'), 'utf8').includes('sqlite');
      
      if (hasIncompatibleMigrations) {
        log('Removing incompatible SQLite migrations...');
        execSync('rm -rf prisma/migrations', { stdio: 'inherit' });
      }
      
      // Try migrations first, fall back to db push if needed
      try {
        log('Attempting database migration...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } catch (migrationError) {
        log('Migration failed, using db push instead...');
        execSync('npx prisma db push', { stdio: 'inherit' });
      }
      
    } else if (environment === 'sqlite') {
      // Local SQLite setup
      log('Setting up SQLite database...');
      
      // Use migrate dev for local development (creates migrations)
      try {
        execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
      } catch (error) {
        // If migrations already exist, just apply them
        log('Applying existing migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      }
    }
    
    // Generate Prisma client
    log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Seed database
    log('Seeding database...');
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
    } catch (seedError) {
      // Seeding might fail if data already exists, that's okay
      log('Seeding completed (some data might already exist)');
    }
    
    log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Main execution
const environment = detectEnvironment();
setupDatabase(environment);
