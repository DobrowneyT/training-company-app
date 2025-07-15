/**
 * Database Seed Script - Creates initial data for multi-company system
 * Compatible with both SQLite (local) and PostgreSQL (production)
 * 
 * @file backend/prisma/seed.js
 * @author Training Company App
 * @version 2.0.0 (Multi-Company Support)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../src/services/encryption');

const prisma = new PrismaClient();

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting database seeding for multi-company system...');

  try {
    // Create MonChoon admin user
    const monChoonPassword = await bcrypt.hash('!@$$1122', 12);
    
    const monChoonAdmin = await prisma.adminUser.upsert({
      where: { username: 'MonChoon' },
      update: {
        password: monChoonPassword,
        email: 'monchoon@trainingcompany.local',
        isActive: true,
        lastLogin: new Date()
      },
      create: {
        username: 'MonChoon',
        password: monChoonPassword,
        email: 'monchoon@trainingcompany.local',
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ MonChoon admin user created/updated:', {
      id: monChoonAdmin.id,
      username: monChoonAdmin.username,
      email: monChoonAdmin.email
    });

    // Keep the original admin user as well
    const defaultAdminPassword = await bcrypt.hash('admin123', 12);
    
    const defaultAdmin = await prisma.adminUser.upsert({
      where: { username: 'admin' },
      update: {
        password: defaultAdminPassword,
        email: 'admin@trainingcompany.local',
        isActive: true
      },
      create: {
        username: 'admin',
        password: defaultAdminPassword,
        email: 'admin@trainingcompany.local',
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ Default admin user maintained:', {
      id: defaultAdmin.id,
      username: defaultAdmin.username
    });

    // Create sample company data for development (only in non-production)
    if (process.env.NODE_ENV !== 'production') {
      // Create MonChoon as a user first
      const sampleApiKey = 'QMUI7c4GHnIP9A57'; // Sample key from your example
      const encryptedApiKey = encrypt(sampleApiKey);
      
      const monChoonUser = await prisma.user.upsert({
        where: { tornId: 2250591 },
        update: {
          name: 'MonChoon',
          apiKey: encryptedApiKey,
          isActive: true,
          companyRole: 'director'
        },
        create: {
          tornId: 2250591,
          name: 'MonChoon',
          apiKey: encryptedApiKey,
          isActive: true,
          companyRole: 'director'
        }
      });

      console.log('✅ MonChoon user created/updated:', {
        id: monChoonUser.id,
        name: monChoonUser.name,
        tornId: monChoonUser.tornId
      });

      // Create Eagle Tavern company
      const eagleTavern = await prisma.company.upsert({
        where: { tornId: 88799 },
        update: {
          name: 'Eagle Tavern',
          companyType: 25,
          ownerId: monChoonUser.id,
          hasTCP: true,
          hasTGP: true,
          advertising: 'Premium training services available',
          trainsAvailable: 0,
          companyBank: BigInt(559240948),
          companyFunds: BigInt(559240948),
          popularity: 87,
          efficiency: 100,
          environment: 98,
          lastSynced: new Date()
        },
        create: {
          tornId: 88799,
          name: 'Eagle Tavern',
          companyType: 25,
          ownerId: monChoonUser.id,
          hasTCP: true,
          hasTGP: true,
          advertising: 'Premium training services available',
          trainsAvailable: 0,
          companyBank: BigInt(559240948),
          companyFunds: BigInt(559240948),
          popularity: 87,
          efficiency: 100,
          environment: 98,
          lastSynced: new Date()
        }
      });

      console.log('✅ Eagle Tavern company created/updated:', {
        id: eagleTavern.id,
        name: eagleTavern.name,
        tornId: eagleTavern.tornId
      });

      // Update MonChoon's company association
      await prisma.user.update({
        where: { id: monChoonUser.id },
        data: { companyId: eagleTavern.id }
      });

      // Create some sample employees from your API response
      const sampleEmployees = [
        { tornId: 343124, name: 'M3G47HR0N', role: 'employee' },
        { tornId: 1137061, name: 'Rohnn', role: 'employee' },
        { tornId: 1624592, name: 'HoongZai', role: 'employee' },
        { tornId: 1809952, name: 'justeat', role: 'trains_buyer' }, // Designated as trains buyer
      ];

      for (const emp of sampleEmployees) {
        const sampleEmpApiKey = `sample${emp.tornId}key1234`.substring(0, 16);
        const encryptedEmpApiKey = encrypt(sampleEmpApiKey);
        
        const employee = await prisma.user.upsert({
          where: { tornId: emp.tornId },
          update: {
            name: emp.name,
            apiKey: encryptedEmpApiKey,
            isActive: true,
            companyId: eagleTavern.id,
            companyRole: emp.role
          },
          create: {
            tornId: emp.tornId,
            name: emp.name,
            apiKey: encryptedEmpApiKey,
            isActive: true,
            companyId: eagleTavern.id,
            companyRole: emp.role
          }
        });

        console.log(`✅ Employee ${emp.name} created/updated with role: ${emp.role}`);
      }

      // Create sample purchase record
      const samplePurchase = await prisma.purchase.create({
        data: {
          companyId: eagleTavern.id,
          trainsPurchased: 500,
          notes: 'Initial training purchase for company setup',
          purchasedBy: monChoonAdmin.id
        }
      });

      console.log('✅ Sample purchase record created:', {
        id: samplePurchase.id,
        trainsPurchased: samplePurchase.trainsPurchased
      });

      // Create sample training request
      const trainsBuyer = await prisma.user.findFirst({
        where: { companyRole: 'trains_buyer' }
      });

      if (trainsBuyer) {
        const sampleRequest = await prisma.trainingRequest.create({
          data: {
            companyId: eagleTavern.id,
            requestedBy: trainsBuyer.id,
            stat: 'Manual Labor',
            quantity: 50,
            targetLevel: 1000000,
            notes: 'Need training for upcoming project',
            status: 'pending'
          }
        });

        console.log('✅ Sample training request created:', {
          id: sampleRequest.id,
          stat: sampleRequest.stat,
          quantity: sampleRequest.quantity
        });
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    const userCount = await prisma.user.count();
    const adminCount = await prisma.adminUser.count();
    const companyCount = await prisma.company.count();
    const purchaseCount = await prisma.purchase.count();
    const requestCount = await prisma.trainingRequest.count();

    console.log('\n📊 Database Summary:');
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   🔐 Admin Users: ${adminCount}`);
    console.log(`   🏢 Companies: ${companyCount}`);
    console.log(`   💰 Purchase Records: ${purchaseCount}`);
    console.log(`   📋 Training Requests: ${requestCount}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n🔑 Admin Credentials:');
      console.log('   MonChoon: username=MonChoon, password=!@$$1122');
      console.log('   Default: username=admin, password=admin123');
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