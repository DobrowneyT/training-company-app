/**
 * @fileoverview Database seeding script
 * @description Seeds the database with initial development data
 * @version 1.0.0
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Main seeding function
 * @async
 * @function main
 * @description Seeds database with initial admin user and sample data
 */
async function main() {
  console.log('Starting database seeding...');

  try {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.adminUser.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword,
        lastLogin: null
      },
      create: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@trainingcompany.local',
        role: 'admin',
        isActive: true
      }
    });

    console.log('Admin user created/updated:', {
      id: admin.id,
      username: admin.username,
      email: admin.email
    });

    // Create a sample user for testing (optional)
    const sampleUser = await prisma.user.upsert({
      where: { tornId: 999999 },
      update: {},
      create: {
        tornId: 999999,
        name: 'Test User',
        apiKey: 'encrypted_test_key_placeholder',
        isActive: true
      }
    });

    console.log('Sample user created/updated:', {
      id: sampleUser.id,
      name: sampleUser.name,
      tornId: sampleUser.tornId
    });

    // Create initial training assignment for sample user
    const initialTraining = await prisma.training.upsert({
      where: { id: 'initial_training_placeholder' },
      update: {},
      create: {
        id: 'initial_training_placeholder',
        userId: sampleUser.id,
        currentStat: 'Not Assigned',
        trainsRemaining: 0,
        notes: 'Sample training assignment for testing'
      }
    });

    console.log('Sample training assignment created:', {
      id: initialTraining.id,
      currentStat: initialTraining.currentStat
    });

    // Create initial system log entry
    await prisma.systemLog.create({
      data: {
        level: 'info',
        message: 'Database seeded successfully',
        data: JSON.stringify({
          adminUsers: 1,
          sampleUsers: 1,
          trainingAssignments: 1
        }),
        source: 'seed'
      }
    });

    console.log('Database seeding completed successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('');
    console.log('IMPORTANT: Change the admin password in production!');

  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
}

/**
 * Execute seeding and handle cleanup
 */
main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
