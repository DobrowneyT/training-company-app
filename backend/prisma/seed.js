/**
 * Database Seed Script - Creates initial data for development and production
 * Compatible with both SQLite (local) and PostgreSQL (production)
 * 
 * @file backend/prisma/seed.js
 * @author Training Company App
 * @version 1.0.0
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../src/services/encryption');

const prisma = new PrismaClient();

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.adminUser.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword,
        email: 'admin@trainingcompany.local',
        isActive: true,
        lastLogin: new Date()
      },
      create: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@trainingcompany.local',
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ Admin user created/updated:', {
      id: admin.id,
      username: admin.username,
      email: admin.email
    });

    // Create sample user for testing (only in development)
    if (process.env.NODE_ENV !== 'production') {
      // Generate a sample encrypted API key
      const sampleApiKey = 'abcd1234efgh5678'; // 16 character sample
      const encryptedApiKey = encrypt(sampleApiKey);
      
      const sampleUser = await prisma.user.upsert({
        where: { tornId: 999999 },
        update: {
          name: 'Test User',
          apiKey: encryptedApiKey,
          isActive: true
        },
        create: {
          tornId: 999999,
          name: 'Test User',
          apiKey: encryptedApiKey,
          isActive: true
        }
      });

      console.log('✅ Sample user created/updated:', {
        id: sampleUser.id,
        name: sampleUser.name,
        tornId: sampleUser.tornId
      });

      // Create sample training assignment for test user
      const existingTraining = await prisma.training.findFirst({
        where: { userId: sampleUser.id, isActive: true }
      });

      if (!existingTraining) {
        const sampleTraining = await prisma.training.create({
          data: {
            userId: sampleUser.id,
            currentStat: 'Not Assigned',
            trainsRemaining: 0,
            notes: 'Sample training assignment for testing'
          }
        });

        console.log('✅ Sample training assignment created:', {
          id: sampleTraining.id,
          currentStat: sampleTraining.currentStat
        });

        // Create sample training session log
        await prisma.trainingSession.create({
          data: {
            userId: sampleUser.id,
            trainingId: sampleTraining.id,
            type: 'assignment_created',
            notes: 'Initial sample training assignment created during seeding'
          }
        });

        console.log('✅ Sample training session logged');
      } else {
        console.log('ℹ️  Sample training assignment already exists');
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    const userCount = await prisma.user.count();
    const adminCount = await prisma.adminUser.count();
    const trainingCount = await prisma.training.count();

    console.log('\n📊 Database Summary:');
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   🔐 Admin Users: ${adminCount}`);
    console.log(`   🏋️  Training Assignments: ${trainingCount}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n🔑 Test Credentials:');
      console.log('   Admin Login: username=admin, password=admin123');
      console.log('   Sample API Key: abcd1234efgh5678 (16 chars)');
    }

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

/**
 * Cleanup function
 */
async function cleanup() {
  await prisma.$disconnect();
}

// Run the seeding
main()
  .then(() => {
    console.log('✅ Seeding process completed');
  })
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await cleanup();
  });