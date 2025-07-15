/**
 * Idempotent Database Seed Script - Safe to run multiple times
 * Uses upsert for all unique constraints to prevent conflicts
 * 
 * @file backend/prisma/seed.js
 * @author Training Company App
 * @version 4.0.0 (Idempotent)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../src/services/encryption');

const prisma = new PrismaClient();

/**
 * Parse Torn API news to extract training information
 * @param {string} newsText - The news text from API
 * @returns {Object|null} Parsed training data or null
 */
function parseTrainingNews(newsText) {
  // Example: "Bartender <a href = http://www.torn.com/profiles.php?XID=2489078>Fluffy-Kitten</a> has been trained by the director"
  const trainingRegex = /(\w+)\s+<a href[^>]*XID=(\d+)>([^<]+)<\/a>\s+has been trained by the director/;
  const match = newsText.match(trainingRegex);
  
  if (match) {
    return {
      position: match[1],
      employeeId: parseInt(match[2]),
      employeeName: match[3],
      isTraining: true
    };
  }
  
  return null;
}

/**
 * Create or update admin users
 * @async
 * @function createAdminUsers
 */
async function createAdminUsers() {
  console.log('Creating admin users...');

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

  console.log('MonChoon admin user created/updated');

  // Keep the original admin user as well
  const defaultAdminPassword = await bcrypt.hash('admin123', 12);
  
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {
      password: defaultAdminPassword,
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

  console.log('Default admin user maintained');

  return { monChoonAdmin };
}

/**
 * Create or update companies and users
 * @async
 * @function createCompaniesAndUsers
 * @param {Object} monChoonAdmin - MonChoon admin user object
 */
async function createCompaniesAndUsers(monChoonAdmin) {
  console.log('Creating companies and users...');

  // Create MonChoon as a user (director)
  const monChoonApiKey = 'QMUI7c4GHnIP9A57'; // Real API key from example
  const encryptedMonChoonKey = encrypt(monChoonApiKey);
  
  const monChoonUser = await prisma.user.upsert({
    where: { tornId: 2250591 },
    update: {
      name: 'MonChoon',
      apiKey: encryptedMonChoonKey,
      isActive: true,
      companyRole: 'director'
    },
    create: {
      tornId: 2250591,
      name: 'MonChoon',
      apiKey: encryptedMonChoonKey,
      isActive: true,
      companyRole: 'director'
    }
  });

  console.log('MonChoon user created/updated');

  // Create Eagle Tavern company with real data
  const eagleTavern = await prisma.company.upsert({
    where: { tornId: 88799 },
    update: {
      name: 'Eagle Tavern',
      companyType: 25, // Restaurant/Bar
      ownerId: monChoonUser.tornId,
      hasTCP: true,
      hasTGP: true,
      advertising: 'Premium training services - Contact MonChoon',
      trainsAvailable: 0,
      companyBank: '559240948',
      companyFunds: '559240948',
      popularity: 87,
      efficiency: 100,
      environment: 98,
      value: '726771558',
      dailyIncome: 1638246,
      dailyCustomers: 15884,
      weeklyIncome: 16117468,
      weeklyCustomers: 147378,
      employeesHired: 10,
      employeesCapacity: 10,
      daysOld: 1658,
      rating: 10,
      companySize: 10,
      staffroomSize: 'Colossal staff room',
      storageSize: 'No storage room',
      storageSpace: 10000,
      advertisingBudget: '10000000',
      lastSynced: new Date()
    },
    create: {
      tornId: 88799,
      name: 'Eagle Tavern',
      companyType: 25,
      ownerId: monChoonUser.tornId,
      hasTCP: true,
      hasTGP: true,
      advertising: 'Premium training services - Contact MonChoon',
      trainsAvailable: 0,
      companyBank: '559240948',
      companyFunds: '559240948',
      popularity: 87,
      efficiency: 100,
      environment: 98,
      value: '726771558',
      dailyIncome: 1638246,
      dailyCustomers: 15884,
      weeklyIncome: 16117468,
      weeklyCustomers: 147378,
      employeesHired: 10,
      employeesCapacity: 10,
      daysOld: 1658,
      rating: 10,
      companySize: 10,
      staffroomSize: 'Colossal staff room',
      storageSize: 'No storage room',
      storageSpace: 10000,
      advertisingBudget: '10000000',
      lastSynced: new Date()
    }
  });

  console.log('Eagle Tavern company created/updated');

  // Update MonChoon's company association
  await prisma.user.update({
    where: { id: monChoonUser.id },
    data: { companyId: eagleTavern.id }
  });

  // Create second company for testing
  const azrelixApiKey = 'sample2750497key12'; // 16 chars
  const encryptedAzrelixKey = encrypt(azrelixApiKey);
  
  const azrelixUser = await prisma.user.upsert({
    where: { tornId: 2750497 },
    update: {
      name: 'Azrelix',
      apiKey: encryptedAzrelixKey,
      isActive: true,
      companyRole: 'director'
    },
    create: {
      tornId: 2750497,
      name: 'Azrelix',
      apiKey: encryptedAzrelixKey,
      isActive: true,
      companyRole: 'director'
    }
  });

  const bigBaddaBoom = await prisma.company.upsert({
    where: { tornId: 12345 },
    update: {
      name: 'Big Badda Boom',
      companyType: 12, // Fireworks Stand
      ownerId: azrelixUser.tornId,
      hasTCP: true,
      hasTGP: true,
      advertising: '390k per train',
      trainsAvailable: 45,
      companyBank: '2500000',
      companyFunds: '2500000',
      value: '5000000',
      advertisingBudget: '1000000',
      lastSynced: new Date()
    },
    create: {
      tornId: 12345,
      name: 'Big Badda Boom',
      companyType: 12,
      ownerId: azrelixUser.tornId,
      hasTCP: true,
      hasTGP: true,
      advertising: '390k per train',
      trainsAvailable: 45,
      companyBank: '2500000',
      companyFunds: '2500000',
      value: '5000000',
      advertisingBudget: '1000000',
      lastSynced: new Date()
    }
  });

  // Create Manchineel as trains buyer for Big Badda Boom
  const manchineelApiKey = 'sample944731key12'; // 16 chars
  const encryptedManchineelKey = encrypt(manchineelApiKey);
  
  const manchineelUser = await prisma.user.upsert({
    where: { tornId: 944731 },
    update: {
      name: 'Manchineel',
      apiKey: encryptedManchineelKey,
      isActive: true,
      companyId: bigBaddaBoom.id,
      companyRole: 'trains_buyer'
    },
    create: {
      tornId: 944731,
      name: 'Manchineel',
      apiKey: encryptedManchineelKey,
      isActive: true,
      companyId: bigBaddaBoom.id,
      companyRole: 'trains_buyer'
    }
  });

  console.log('Big Badda Boom company created with owner and trains buyer');

  return { monChoonUser, eagleTavern, azrelixUser, bigBaddaBoom, manchineelUser };
}

/**
 * Create or update employee records
 * @async
 * @function createEmployees
 * @param {Object} eagleTavern - Eagle Tavern company object
 */
async function createEmployees(eagleTavern) {
  console.log('Creating employee records...');

  // Real employee data from API
  const realEmployees = [
    {
      tornId: 343124,
      name: 'M3G47HR0N',
      position: 'Bartender',
      daysInCompany: 1155,
      manualLabor: 460199,
      intelligence: 423674,
      endurance: 443965,
      workingStats: 169,
      settledIn: 10,
      directorEducation: 12,
      addiction: -2,
      totalEffectiveness: 189,
      lastActionStatus: 'Offline',
      lastActionTimestamp: 1752554985,
      lastActionRelative: '14 minutes ago',
      role: 'employee'
    },
    {
      tornId: 1137061,
      name: 'Rohnn',
      position: 'Waiter',
      daysInCompany: 1476,
      manualLabor: 184495,
      intelligence: 101041,
      endurance: 221687,
      workingStats: 158,
      settledIn: 10,
      merits: 3,
      directorEducation: 12,
      addiction: -8,
      totalEffectiveness: 175,
      lastActionStatus: 'Offline',
      lastActionTimestamp: 1752508522,
      lastActionRelative: '13 hours ago',
      role: 'employee'
    },
    {
      tornId: 1624592,
      name: 'HoongZai',
      position: 'Manager',
      daysInCompany: 866,
      manualLabor: 118919,
      intelligence: 171196,
      endurance: 239872,
      workingStats: 147,
      settledIn: 10,
      directorEducation: 12,
      totalEffectiveness: 169,
      lastActionStatus: 'Offline',
      lastActionTimestamp: 1752539296,
      lastActionRelative: '4 hours ago',
      role: 'employee'
    },
    {
      tornId: 1809952,
      name: 'justeat',
      position: 'Bartender',
      daysInCompany: 1196,
      manualLabor: 187387,
      intelligence: 82567,
      endurance: 294340,
      workingStats: 160,
      settledIn: 10,
      merits: 9,
      directorEducation: 12,
      addiction: -20,
      totalEffectiveness: 171,
      lastActionStatus: 'Online',
      lastActionTimestamp: 1752555754,
      lastActionRelative: '1 minute ago',
      statusDescription: 'Traveling to Switzerland',
      statusState: 'Traveling',
      statusColor: 'blue',
      role: 'trains_buyer'
    },
    {
      tornId: 1870130,
      name: 'Betrayer',
      position: 'Bartender',
      daysInCompany: 1421,
      manualLabor: 102674,
      intelligence: 38325,
      endurance: 170540,
      workingStats: 151,
      settledIn: 10,
      merits: 5,
      directorEducation: 12,
      addiction: -6,
      totalEffectiveness: 172,
      lastActionStatus: 'Offline',
      lastActionTimestamp: 1752525481,
      lastActionRelative: '8 hours ago',
      role: 'employee'
    },
    {
      tornId: 2131289,
      name: 'Zasty',
      position: 'Bartender',
      daysInCompany: 227,
      manualLabor: 98956,
      intelligence: 71149,
      endurance: 154778,
      workingStats: 150,
      settledIn: 10,
      merits: 10,
      directorEducation: 12,
      totalEffectiveness: 182,
      lastActionStatus: 'Offline',
      lastActionTimestamp: 1752518046,
      lastActionRelative: '10 hours ago',
      role: 'employee'
    },
    {
      tornId: 2271951,
      name: 'KASTRO_',
      position: 'Bouncer',
      daysInCompany: 1490,
      manualLabor: 104069,
      intelligence: 16224,
      endurance: 174007,
      workingStats: 141,
      settledIn: 10,
      merits: 1,
      directorEducation: 12,
      addiction: -5,
      totalEffectiveness: 159,
      lastActionStatus: 'Offline',
      lastActionTimestamp: 1752552407,
      lastActionRelative: '56 minutes ago',
      role: 'employee'
    },
    {
      tornId: 2489078,
      name: 'Fluffy-Kitten',
      position: 'Bartender',
      daysInCompany: 623,
      manualLabor: 59674,
      intelligence: 54508,
      endurance: 162852,
      workingStats: 147,
      settledIn: 10,
      merits: 10,
      directorEducation: 12,
      addiction: -4,
      totalEffectiveness: 175,
      lastActionStatus: 'Offline',
      lastActionTimestamp: 1752537095,
      lastActionRelative: '5 hours ago',
      role: 'employee'
    },
    {
      tornId: 2595950,
      name: 'Trencal',
      position: 'Promoter',
      daysInCompany: 831,
      manualLabor: 82282,
      intelligence: 111537,
      endurance: 161977,
      workingStats: 142,
      settledIn: 10,
      merits: 6,
      directorEducation: 12,
      addiction: -6,
      totalEffectiveness: 164,
      lastActionStatus: 'Offline',
      lastActionTimestamp: 1752545157,
      lastActionRelative: '2 hours ago',
      role: 'employee'
    },
    {
      tornId: 2731377,
      name: 'Hugo',
      position: 'Bartender',
      daysInCompany: 948,
      manualLabor: 49875,
      intelligence: 21899,
      endurance: 106807,
      workingStats: 143,
      settledIn: 10,
      merits: 8,
      directorEducation: 12,
      addiction: -9,
      totalEffectiveness: 164,
      lastActionStatus: 'Offline',
      lastActionTimestamp: 1752548482,
      lastActionRelative: '2 hours ago',
      role: 'employee'
    }
  ];

  // Create all employees and their detailed records
  for (const emp of realEmployees) {
    const apiKey = `sample${emp.tornId}key1234`.substring(0, 16);
    const encryptedApiKey = encrypt(apiKey);
    
    // Create or update user
    const employee = await prisma.user.upsert({
      where: { tornId: emp.tornId },
      update: {
        name: emp.name,
        apiKey: encryptedApiKey,
        isActive: true,
        companyId: eagleTavern.id,
        companyRole: emp.role
      },
      create: {
        tornId: emp.tornId,
        name: emp.name,
        apiKey: encryptedApiKey,
        isActive: true,
        companyId: eagleTavern.id,
        companyRole: emp.role
      }
    });

    // Create detailed employee record
    await prisma.employeeDetails.upsert({
      where: { userId: employee.id },
      update: {
        position: emp.position,
        daysInCompany: emp.daysInCompany,
        manualLabor: emp.manualLabor,
        intelligence: emp.intelligence,
        endurance: emp.endurance,
        workingStats: emp.workingStats,
        settledIn: emp.settledIn,
        directorEducation: emp.directorEducation,
        merits: emp.merits || 0,
        addiction: emp.addiction || 0,
        totalEffectiveness: emp.totalEffectiveness,
        lastActionStatus: emp.lastActionStatus,
        lastActionTimestamp: emp.lastActionTimestamp,
        lastActionRelative: emp.lastActionRelative,
        statusDescription: emp.statusDescription || 'Okay',
        statusState: emp.statusState || 'Okay',
        statusColor: emp.statusColor || 'green',
        lastUpdated: new Date()
      },
      create: {
        userId: employee.id,
        companyId: eagleTavern.id,
        position: emp.position,
        daysInCompany: emp.daysInCompany,
        manualLabor: emp.manualLabor,
        intelligence: emp.intelligence,
        endurance: emp.endurance,
        workingStats: emp.workingStats,
        settledIn: emp.settledIn,
        directorEducation: emp.directorEducation,
        merits: emp.merits || 0,
        addiction: emp.addiction || 0,
        totalEffectiveness: emp.totalEffectiveness,
        lastActionStatus: emp.lastActionStatus,
        lastActionTimestamp: emp.lastActionTimestamp,
        lastActionRelative: emp.lastActionRelative,
        statusDescription: emp.statusDescription || 'Okay',
        statusState: emp.statusState || 'Okay',
        statusColor: emp.statusColor || 'green'
      }
    });

    console.log(`Employee ${emp.name} (${emp.position}) created/updated with detailed stats`);
  }

  return realEmployees;
}

/**
 * Create or update news and training logs
 * @async
 * @function createNewsAndTrainingLogs
 * @param {Object} eagleTavern - Eagle Tavern company object
 */
async function createNewsAndTrainingLogs(eagleTavern) {
  console.log('Creating news and training logs...');

  // Real news data from API
  const realNewsData = [
    {
      newsId: 'edr6XhgCeXADOvUEPjjM',
      newsText: 'Bartender <a href = http://www.torn.com/profiles.php?XID=2489078>Fluffy-Kitten</a> has been trained by the director',
      timestamp: 1752504632
    },
    {
      newsId: 'U00PxkmQJ007WuFgdIuY',
      newsText: 'Bartender <a href = http://www.torn.com/profiles.php?XID=2731377>Hugo</a> has been trained by the director',
      timestamp: 1752504632
    },
    {
      newsId: 'Firq8FDkNg8jkiW71RNv',
      newsText: 'Waiter <a href = http://www.torn.com/profiles.php?XID=1137061>Rohnn</a> has been trained by the director',
      timestamp: 1752504631
    },
    {
      newsId: 'rhwiFXFahr2zNXRlkMDW',
      newsText: 'Bartender <a href = http://www.torn.com/profiles.php?XID=1809952>justeat</a> has been trained by the director',
      timestamp: 1752517941
    },
    {
      newsId: 'nrcHOyhZu38pWIb8cVyn',
      newsText: 'Bartender <a href = http://www.torn.com/profiles.php?XID=343124>M3G47HR0N</a> has been trained by the director',
      timestamp: 1752517941
    }
  ];

  // Process news data and create training logs
  for (const news of realNewsData) {
    const parsedData = parseTrainingNews(news.newsText);
    
    if (parsedData && parsedData.isTraining) {
      // Find the employee user
      const trainedEmployee = await prisma.user.findUnique({
        where: { tornId: parsedData.employeeId }
      });

      if (trainedEmployee) {
        // Create company news record (upsert to prevent duplicates)
        await prisma.companyNews.upsert({
          where: { newsId: news.newsId },
          update: {
            newsText: news.newsText,
            timestamp: news.timestamp,
            newsType: 'training',
            employeeId: parsedData.employeeId,
            employeeName: parsedData.employeeName,
            position: parsedData.position
          },
          create: {
            companyId: eagleTavern.id,
            newsId: news.newsId,
            newsText: news.newsText,
            timestamp: news.timestamp,
            newsType: 'training',
            employeeId: parsedData.employeeId,
            employeeName: parsedData.employeeName,
            position: parsedData.position
          }
        });

        // Create training log (upsert to prevent duplicates)
        await prisma.trainingLog.upsert({
          where: { eventId: news.newsId },
          update: {
            timestamp: news.timestamp,
            position: parsedData.position,
            manualLaborGained: 0,
            intelligenceGained: 0,
            enduranceGained: 0
          },
          create: {
            companyId: eagleTavern.id,
            trainedById: trainedEmployee.id,
            eventId: news.newsId,
            timestamp: news.timestamp,
            position: parsedData.position,
            manualLaborGained: 0,
            intelligenceGained: 0,
            enduranceGained: 0
          }
        });

        console.log(`Training log created/updated for ${parsedData.employeeName} (${parsedData.position})`);
      }
    }
  }
}

/**
 * Create sample purchase records (only if they don't exist)
 * @async
 * @function createSamplePurchases
 * @param {Object} eagleTavern - Eagle Tavern company object
 * @param {Object} monChoonAdmin - MonChoon admin user object
 */
async function createSamplePurchases(eagleTavern, monChoonAdmin) {
  console.log('Creating sample purchase records...');

  const samplePurchases = [
    { trains: 500, date: new Date('2024-12-01'), notes: 'Initial training purchase batch' },
    { trains: 300, date: new Date('2024-12-15'), notes: 'Holiday training boost' },
    { trains: 200, date: new Date('2025-01-01'), notes: 'New Year training package' }
  ];

  for (const purchase of samplePurchases) {
    // Check if purchase already exists (since Purchase doesn't have unique constraints,
    // we'll check by combination of fields)
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        companyId: eagleTavern.id,
        trainsPurchased: purchase.trains,
        purchaseDate: purchase.date,
        purchasedBy: monChoonAdmin.id
      }
    });

    if (!existingPurchase) {
      await prisma.purchase.create({
        data: {
          companyId: eagleTavern.id,
          trainsPurchased: purchase.trains,
          purchaseDate: purchase.date,
          notes: purchase.notes,
          purchasedBy: monChoonAdmin.id
        }
      });
      console.log(`Purchase record created: ${purchase.trains} trains on ${purchase.date.toDateString()}`);
    } else {
      console.log(`Purchase record already exists: ${purchase.trains} trains on ${purchase.date.toDateString()}`);
    }
  }
}

/**
 * Create sample training request (only if it doesn't exist)
 * @async
 * @function createSampleTrainingRequest
 * @param {Object} eagleTavern - Eagle Tavern company object
 */
async function createSampleTrainingRequest(eagleTavern) {
  console.log('Creating sample training request...');

  const trainsBuyer = await prisma.user.findFirst({
    where: { companyRole: 'trains_buyer', companyId: eagleTavern.id }
  });

  if (trainsBuyer) {
    // Check if training request already exists
    const existingRequest = await prisma.trainingRequest.findFirst({
      where: {
        companyId: eagleTavern.id,
        requestedBy: trainsBuyer.id,
        stat: 'Manual Labor',
        quantity: 100,
        status: 'pending'
      }
    });

    if (!existingRequest) {
      await prisma.trainingRequest.create({
        data: {
          companyId: eagleTavern.id,
          requestedBy: trainsBuyer.id,
          stat: 'Manual Labor',
          quantity: 100,
          targetLevel: 500000,
          notes: 'Need ML training for upcoming faction war preparation',
          status: 'pending'
        }
      });
      console.log('Sample training request created');
    } else {
      console.log('Sample training request already exists');
    }
  }
}

/**
 * Main seeding function
 */
async function main() {
  console.log('Starting idempotent database seeding for multi-company system...');

  try {
    // Create admin users
    const { monChoonAdmin } = await createAdminUsers();

    // Only create sample data in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      // Create companies and users
      const { monChoonUser, eagleTavern, azrelixUser, bigBaddaBoom, manchineelUser } = 
        await createCompaniesAndUsers(monChoonAdmin);

      // Create employee records
      await createEmployees(eagleTavern);

      // Create news and training logs
      await createNewsAndTrainingLogs(eagleTavern);

      // Create sample purchase records
      await createSamplePurchases(eagleTavern, monChoonAdmin);

      // Create sample training request
      await createSampleTrainingRequest(eagleTavern);
    }

    console.log('Idempotent database seeding completed successfully!');
    
    // Display comprehensive summary
    const userCount = await prisma.user.count();
    const adminCount = await prisma.adminUser.count();
    const companyCount = await prisma.company.count();
    const employeeDetailsCount = await prisma.employeeDetails.count();
    const trainingLogCount = await prisma.trainingLog.count();
    const companyNewsCount = await prisma.companyNews.count();
    const purchaseCount = await prisma.purchase.count();
    const requestCount = await prisma.trainingRequest.count();

    console.log('\nDatabase Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Admin Users: ${adminCount}`);
    console.log(`   Companies: ${companyCount}`);
    console.log(`   Employee Details: ${employeeDetailsCount}`);
    console.log(`   Training Logs: ${trainingLogCount}`);
    console.log(`   Company News: ${companyNewsCount}`);
    console.log(`   Purchase Records: ${purchaseCount}`);
    console.log(`   Training Requests: ${requestCount}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('\nAdmin Credentials:');
      console.log('   MonChoon: username=MonChoon, password=!@$$1122');
      console.log('   Default: username=admin, password=admin123');
      console.log('\nSample Companies:');
      console.log('   Eagle Tavern (ID: 88799) - Owner: MonChoon');
      console.log('   Big Badda Boom (ID: 12345) - Owner: Azrelix');
    }

  } catch (error) {
    console.error('Error during idempotent database seeding:', error);
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
    console.log('Idempotent seeding process completed');
  })
  .catch((e) => {
    console.error('Idempotent seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await cleanup();
  });