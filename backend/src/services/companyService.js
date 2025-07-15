/**
 * @fileoverview Company management service
 * @description Handles company registration, employee sync, and Torn API integration
 * @version 1.0.0
 */

const { prisma } = require('./database');
const { encrypt, decrypt } = require('./encryption');
const axios = require('axios');

/**
 * Company service class for managing multi-company operations
 * @class CompanyService
 */
class CompanyService {
  constructor() {
    this.tornAPIBaseURL = 'https://api.torn.com';
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting for Torn API requests
   * @private
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch company data from Torn API
   * @async
   * @param {string} apiKey - Owner's Torn API key
   * @returns {Promise<Object>} Company data from Torn API
   * @throws {Error} If API request fails
   */
  async fetchCompanyData(apiKey) {
    await this.rateLimit();
    
    try {
      const url = `${this.tornAPIBaseURL}/company/?selections=employees,detailed,profile&key=${apiKey}`;
      
      console.log('Fetching company data from Torn API...');
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'TrainingCompanyApp/2.0'
        }
      });

      if (response.data.error) {
        throw new Error(`Torn API Error ${response.data.error.code}: ${response.data.error.error}`);
      }

      return response.data;
    } catch (error) {
      console.error('Company API fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Register or update a company from Torn API data
   * @async
   * @param {string} apiKey - Owner's Torn API key
   * @param {number} ownerTornId - Owner's Torn ID
   * @returns {Promise<Object>} Created or updated company
   * @throws {Error} If registration fails
   */
  async registerCompany(apiKey, ownerTornId) {
    try {
      console.log(`Registering company for user ${ownerTornId}...`);
      
      // Fetch company data from Torn API
      const companyData = await this.fetchCompanyData(apiKey);
      
      // Extract company information
      const companyInfo = companyData.company;
      const detailedInfo = companyData.company_detailed;
      
      if (!companyInfo) {
        throw new Error('No company data found - user may not own a company');
      }

      // Find the owner user
      const owner = await prisma.user.findUnique({
        where: { tornId: ownerTornId }
      });

      if (!owner) {
        throw new Error('Owner user not found in database');
      }

      // Check if company already exists
      let company = await prisma.company.findUnique({
        where: { tornId: companyInfo.ID }
      });

      const companyDataToSave = {
        tornId: companyInfo.ID,
        name: companyInfo.name,
        companyType: companyInfo.company_type,
        ownerId: owner.id,
        trainsAvailable: detailedInfo?.trains_available || 0,
        companyBank: BigInt(detailedInfo?.company_bank || 0),
        companyFunds: BigInt(detailedInfo?.company_funds || 0),
        popularity: detailedInfo?.popularity || 0,
        efficiency: detailedInfo?.efficiency || 0,
        environment: detailedInfo?.environment || 0,
        lastSynced: new Date()
      };

      if (company) {
        // Update existing company
        company = await prisma.company.update({
          where: { id: company.id },
          data: companyDataToSave
        });
        console.log(`Company ${companyInfo.name} updated`);
      } else {
        // Create new company
        company = await prisma.company.create({
          data: companyDataToSave
        });
        console.log(`Company ${companyInfo.name} created`);
      }

      // Update owner's company association and role
      await prisma.user.update({
        where: { id: owner.id },
        data: {
          companyId: company.id,
          companyRole: 'director'
        }
      });

      // Sync employees
      await this.syncEmployees(company.id, companyData.company.employees);

      return company;
      
    } catch (error) {
      console.error('Company registration error:', error.message);
      throw error;
    }
  }

  /**
   * Sync company employees from Torn API data
   * @async
   * @param {string} companyId - Company ID in database
   * @param {Object} employeesData - Employees data from Torn API
   */
  async syncEmployees(companyId, employeesData) {
    try {
      console.log('Syncing company employees...');
      
      for (const [tornId, employeeInfo] of Object.entries(employeesData)) {
        const employeeTornId = parseInt(tornId);
        
        // Skip if this is the director (already handled)
        const existingUser = await prisma.user.findUnique({
          where: { tornId: employeeTornId }
        });

        if (existingUser && existingUser.companyRole === 'director') {
          continue;
        }

        // Create or update employee
        await prisma.user.upsert({
          where: { tornId: employeeTornId },
          update: {
            name: employeeInfo.name,
            companyId: companyId,
            companyRole: 'employee',
            isActive: true
          },
          create: {
            tornId: employeeTornId,
            name: employeeInfo.name,
            apiKey: encrypt('temp_key_needs_update'), // Placeholder
            companyId: companyId,
            companyRole: 'employee',
            isActive: true
          }
        });
      }
      
      console.log(`Synced ${Object.keys(employeesData).length} employees`);
      
    } catch (error) {
      console.error('Employee sync error:', error.message);
      throw error;
    }
  }

  /**
   * Get all companies with aggregated data for admin dashboard
   * @async
   * @returns {Promise<Array>} Array of companies with statistics
   */
  async getAllCompaniesWithStats() {
    try {
      const companies = await prisma.company.findMany({
        include: {
          owner: {
            select: { id: true, name: true, tornId: true }
          },
          employees: {
            select: { id: true, name: true, tornId: true, companyRole: true }
          },
          purchases: {
            orderBy: { purchaseDate: 'desc' }
          },
          trainingRequests: {
            where: { status: 'pending' },
            select: { id: true, stat: true, quantity: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate statistics for each company
      const companiesWithStats = companies.map(company => {
        const totalTrainsPurchased = company.purchases.reduce(
          (sum, purchase) => sum + purchase.trainsPurchased, 0
        );
        
        const pendingRequests = company.trainingRequests.length;
        const totalRequestedTrains = company.trainingRequests.reduce(
          (sum, request) => sum + request.quantity, 0
        );

        const trainsBuyer = company.employees.find(emp => emp.companyRole === 'trains_buyer');

        return {
          id: company.id,
          tornId: company.tornId,
          name: company.name,
          companyType: company.companyType,
          owner: company.owner,
          trainsBuyer: trainsBuyer || null,
          hasTCP: company.hasTCP,
          hasTGP: company.hasTGP,
          advertising: company.advertising,
          trainsAvailable: company.trainsAvailable,
          companyBank: company.companyBank.toString(), // Convert BigInt for JSON
          companyFunds: company.companyFunds.toString(),
          popularity: company.popularity,
          efficiency: company.efficiency,
          environment: company.environment,
          employeeCount: company.employees.length,
          totalTrainsPurchased,
          pendingRequests,
          totalRequestedTrains,
          lastSynced: company.lastSynced,
          isActive: company.isActive,
          createdAt: company.createdAt
        };
      });

      return companiesWithStats;
      
    } catch (error) {
      console.error('Error fetching companies with stats:', error.message);
      throw error;
    }
  }

  /**
   * Add purchase record for a company
   * @async
   * @param {string} companyId - Company ID
   * @param {number} trainsPurchased - Number of trains purchased
   * @param {string} notes - Optional notes
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Created purchase record
   */
  async addPurchase(companyId, trainsPurchased, notes, adminId) {
    try {
      const purchase = await prisma.purchase.create({
        data: {
          companyId,
          trainsPurchased: parseInt(trainsPurchased),
          notes,
          purchasedBy: adminId
        }
      });

      console.log(`Purchase recorded: ${trainsPurchased} trains for company ${companyId}`);
      return purchase;
      
    } catch (error) {
      console.error('Error adding purchase:', error.message);
      throw error;
    }
  }
}

/**
 * Singleton instance of CompanyService
 * @type {CompanyService}
 */
const companyService = new CompanyService();

module.exports = companyService;