/**
 * Comprehensive Mock Data for Training Company App
 * Centralized data source for all development and testing
 * 
 * @file src/data/mockData.js
 * @author Training Company App
 * @version 2.1.0 (Simplified - calculations moved to components)
 */

/**
 * Big Badda Boom employee data (from spreadsheet)
 */
export const bigBaddaBoomEmployees = [
  { id: 1, name: 'Manchineel', tornId: 944731, position: 'Trainer', trainsReceived: 900, status: 'active', joinDate: '2024-01-15', workStats: { manualLabor: 4200, intelligence: 3800, endurance: 4500 } },
  { id: 2, name: 'VenomImoneV', tornId: 1378953, position: 'Salesperson', trainsReceived: 450, status: 'active', joinDate: '2024-02-01', workStats: { manualLabor: 3200, intelligence: 4100, endurance: 3500 } },
  { id: 3, name: 'NATURE-HUSBAND', tornId: 2714515, position: 'Picker Packer', trainsReceived: 320, status: 'active', joinDate: '2024-02-15', workStats: { manualLabor: 3800, intelligence: 2900, endurance: 4200 } },
  { id: 4, name: 'Ballinzki', tornId: 2868896, position: 'Salesperson', trainsReceived: 380, status: 'active', joinDate: '2024-03-01', workStats: { manualLabor: 3100, intelligence: 3900, endurance: 3300 } },
  { id: 5, name: 'Ruvius', tornId: 2966888, position: 'Salesperson', trainsReceived: 420, status: 'active', joinDate: '2024-03-10', workStats: { manualLabor: 3300, intelligence: 4200, endurance: 3600 } },
  { id: 6, name: '12Keys2Twilight', tornId: 3057202, position: 'Picker Packer', trainsReceived: 290, status: 'active', joinDate: '2024-03-20', workStats: { manualLabor: 3600, intelligence: 2800, endurance: 4000 } },
  { id: 7, name: 'Buloyzki', tornId: 3060209, position: 'Trainer', trainsReceived: 480, status: 'active', joinDate: '2024-04-01', workStats: { manualLabor: 4000, intelligence: 3700, endurance: 4300 } },
  { id: 8, name: 'Tornyborny-HUSBAND', tornId: 3283930, position: 'Salesperson', trainsReceived: 350, status: 'active', joinDate: '2024-04-15', workStats: { manualLabor: 2900, intelligence: 3800, endurance: 3200 } },
  { id: 9, name: 'b0rn2kill', tornId: 3293666, position: 'Trainer', trainsReceived: 520, status: 'active', joinDate: '2024-05-01', workStats: { manualLabor: 4100, intelligence: 3900, endurance: 4400 } },
  { id: 10, name: 'xavier2390', tornId: 3297502, position: 'Trainer', trainsReceived: 490, status: 'active', joinDate: '2024-05-15', workStats: { manualLabor: 3900, intelligence: 4000, endurance: 4200 } },
];

/**
 * Big Badda Boom company data (calculated from training logs)
 */
export const bigBaddaBoomCompany = {
  id: 'big-badda-boom',
  name: 'Big Badda Boom',
  type: 'Fireworks Stand',
  companyType: 12,
  owner: { name: 'Azrelix', tornId: 2750497 },
  director: { name: 'Azrelix', tornId: 2750497 },
  trainsBuyer: { 
    name: 'Manchineel', 
    tornId: 944731,
    totalTrainsPurchased: 900,
    currentStat: 'Manual Labor',
    targetLevel: 5000,
    currentLevel: 4200,
    notes: 'Active training program - Manual Labor focus'
  },
  rate: 390000,
  advertisingCost: 100000,  // Daily advertising cost
  currentStock: 15420,     // Current fireworks stock
  hasTCP: true,
  hasTGP: true,
  education: 'All',
  advertising: '390k per train',
  totalTrainsPurchased: 900,
  status: 'good',
  sheetLink: 'https://docs.google.com/spreadsheets/d/1hFEa1_4kvkHEg3G-mfecPCETbqL8AhfMrQ7kN80qVyY',
  employeeCount: bigBaddaBoomEmployees.length,
  companyBank: 12500000,
  isActive: true,
  employees: bigBaddaBoomEmployees,
  trainingLogs: null,
  lastScraped: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
};

/**
 * All companies including Big Badda Boom and others
 */
export const mockRealCompanies = [
  bigBaddaBoomCompany,
  {
    id: 'kn-fireworks',
    name: 'KN-fireworks',
    type: 'Fireworks Stand',
    companyType: 12,
    owner: { name: 'Styv-03', tornId: 2395198 },
    director: { name: 'Styv-03', tornId: 2395198 },
    trainsBuyer: { name: 'Shyam09', tornId: 3703288 },
    rate: 375000,
    hasTCP: true,
    hasTGP: true,
    education: 'All',
    advertising: '',
    totalTrainsPurchased: 300,
    trainsRemaining: -25,
    daysRemaining: -1.8,
    status: 'critical',
    sheetLink: 'https://docs.google.com/spreadsheets/d/1rFB7ZQqjIYtNZ4O2xWS597KCkzBpVA6SSEbqVwuYURU',
    employeeCount: 23,
    isActive: true
  },
  {
    id: 'sky-skipper',
    name: 'Sky Skipper Fireworks',
    type: 'Fireworks Stand',
    companyType: 12,
    owner: { name: 'DavidDJ', tornId: 3283862 },
    director: { name: 'DavidDJ', tornId: 3283862 },
    trainsBuyer: { name: 'FAFOU', tornId: 3082159 },
    rate: 400000,
    hasTCP: true,
    hasTGP: true,
    education: 'All',
    advertising: '',
    totalTrainsPurchased: 778,
    trainsRemaining: 135,
    daysRemaining: 8.2,
    status: 'good',
    sheetLink: 'https://docs.google.com/spreadsheets/d/18EnvaQjk98e3YS3ST33b1yb2thX8oI1LAmIq7UfGQfQ/',
    employeeCount: 31,
    isActive: true
  },
  {
    id: 'black-powder',
    name: 'Black Powder',
    type: 'Fireworks Stand',
    companyType: 12,
    owner: { name: 'Harumbu', tornId: 2819176 },
    director: { name: 'Harumbu', tornId: 2819176 },
    trainsBuyer: { name: 'Kelpgrizzley', tornId: 3189518 },
    rate: 385000,
    hasTCP: true,
    hasTGP: true,
    education: 'All',
    advertising: '',
    totalTrainsPurchased: 800,
    trainsRemaining: 339,
    daysRemaining: 22.6,
    status: 'good',
    sheetLink: 'https://docs.google.com/spreadsheets/d/1eGorosCD7EgVi10JWhlhk8H91M1aQtIk0PCQGR69jc8',
    employeeCount: 25,
    isActive: true
  },
  {
    id: 'eagle-tavern',
    name: 'Eagle Tavern',
    type: 'Pub',
    companyType: 25,
    owner: { name: 'MonChoon', tornId: 2250591 },
    director: { name: 'MonChoon', tornId: 2250591 },
    trainsBuyer: { name: 'Kelpgrizzley', tornId: 3189518 },
    rate: 500000,
    hasTCP: true,
    hasTGP: true,
    education: 'All',
    advertising: '',
    totalTrainsPurchased: 800,
    trainsRemaining: 339,
    daysRemaining: 22.6,
    status: 'good',
    sheetLink: 'https://docs.google.com/spreadsheets/d/1eGorosCD7EgVi10JWhlhk8H91M1aQtIk0PCQGR69jc8',
    employeeCount: 25,
    isActive: true
  }
];

/**
 * Mock admin user data
 */
export const mockAdminUser = {
  id: 'admin_1',
  username: 'MonChoon',
  email: 'choonboy@gmail.com',
  role: 'Administrator',
  tornId: 2250591,
  isActive: true,
  lastLogin: new Date(),
  createdAt: new Date('2024-01-01')
};

/**
 * Mock client user data (for Manchineel)
 */
export const mockClientUser = {
  id: 'client_1',
  name: 'Manchineel',
  tornId: 944731,
  isAuthenticated: true,
  lastUpdated: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
};

/**
 * Mock director user data (for Azrelix)
 */
export const mockDirectorUser = {
  id: 'director_1',
  username: 'Azrelix',
  tornId: 2750497,
  role: 'Company Director',
  isAuthenticated: true,
  isScrapingActive: false,
  lastUpdated: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
};

/**
 * Simple data access functions (complex calculations moved to components)
 */

/**
 * Get company data by ID
 * @param {string} companyId - Company ID
 * @returns {Object|null} Company data or null if not found
 */
export const getCompanyById = (companyId) => {
  return mockRealCompanies.find(company => company.id === companyId) || null;
};

/**
 * Get employee data for a company
 * @param {string} companyId - Company ID
 * @returns {Array} Array of employees
 */
export const getCompanyEmployees = (companyId) => {
  const company = getCompanyById(companyId);
  return company?.employees || [];
};

/**
 * Get training logs for a company
 * @param {string} companyId - Company ID
 * @param {number} days - Number of days to retrieve (default: 30)
 * @returns {Array} Array of training logs
 */
export const getCompanyTrainingLogs = (companyId, days = 30) => {
  const company = getCompanyById(companyId);
  if (!company?.trainingLogs) return [];
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return company.trainingLogs.filter(log => 
    new Date(log.date) >= cutoffDate
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Most recent first
};

/**
 * Calculate analytics from all companies
 */
export const calculateAnalytics = () => {
  const totalCompanies = mockRealCompanies.length;
  const totalEmployees = mockRealCompanies.reduce((sum, company) => sum + (company.employeeCount || 0), 0);
  const totalTrainsPurchased = mockRealCompanies.reduce((sum, company) => sum + (company.totalTrainsPurchased || 0), 0);
  const pendingRequests = mockRealCompanies.filter(company => company.status === 'critical').length;
  
  return {
    totalCompanies,
    totalEmployees,
    totalTrainsPurchased,
    pendingRequests,
    completedRequests: totalCompanies - pendingRequests,
    totalRevenue: totalTrainsPurchased * 390000, // Average rate
    averageTrainsPerCompany: totalTrainsPurchased / totalCompanies,
    mostActiveCompany: mockRealCompanies.reduce((max, company) => 
      (company.totalTrainsPurchased || 0) > (max.totalTrainsPurchased || 0) ? company : max
    ).id,
    lastUpdated: new Date()
  };
};

/**
 * Update company data (simulates API call)
 * @param {string} companyId - Company ID
 * @param {Object} updates - Data to update
 * @returns {Object} Updated company data
 */
export const updateCompanyData = (companyId, updates) => {
  const companyIndex = mockRealCompanies.findIndex(company => company.id === companyId);
  if (companyIndex === -1) return null;
  
  mockRealCompanies[companyIndex] = {
    ...mockRealCompanies[companyIndex],
    ...updates,
    lastUpdated: new Date()
  };
  
  return mockRealCompanies[companyIndex];
};

/**
 * Add training log entry (simulates API call)
 * @param {string} companyId - Company ID
 * @param {Object} logEntry - Log entry data
 * @returns {Object} Added log entry
 */
export const addTrainingLog = (companyId, logEntry) => {
  const company = getCompanyById(companyId);
  if (!company) return null;
  
  const newLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    companyId,
    ...logEntry
  };
  
  if (!company.trainingLogs) company.trainingLogs = [];
  company.trainingLogs.unshift(newLog); // Add to beginning (most recent first)
  
  return newLog;
};

export default {
  // Data objects
  mockRealCompanies,
  bigBaddaBoomCompany,
  mockAdminUser,
  mockClientUser,
  mockDirectorUser,
  bigBaddaBoomEmployees,
  
  // Utility functions
  calculateAnalytics,
  getCompanyById,
  getCompanyEmployees,
  getCompanyTrainingLogs,
  updateCompanyData,
  addTrainingLog
};