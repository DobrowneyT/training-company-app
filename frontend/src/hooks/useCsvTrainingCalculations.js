/**
 * Custom hook for CSV-based training calculations
 * Calculates trains received, remaining, averages, and stat totals from CSV data
 * 
 * @file src/hooks/useCsvTrainingCalculations.js
 * @author Training Company App
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { bigBaddaBoomEmployees } from '../data/mockData';

/**
 * Convert Unix timestamp to Date object
 * @param {number} timestamp - Unix timestamp
 * @returns {Date} JavaScript Date object
 */
const timestampToDate = (timestamp) => {
  return new Date(timestamp * 1000);
};

/**
 * Map User ID to employee data
 * @param {string} userId - User ID from CSV
 * @returns {Object|null} Employee data or null if not found
 */
const mapUserIdToEmployee = (userId) => {
  // Try to find by tornId first (assuming User ID might be tornId)
  let employee = bigBaddaBoomEmployees.find(emp => emp.tornId.toString() === userId);
  
  // If not found, try by name (assuming User ID might be name)
  if (!employee) {
    employee = bigBaddaBoomEmployees.find(emp => emp.name === userId);
  }
  
  // If still not found, try by ID
  if (!employee) {
    employee = bigBaddaBoomEmployees.find(emp => emp.id.toString() === userId);
  }
  
  return employee || null;
};

/**
 * Transform CSV row to training entry
 * @param {Object} csvRow - Raw CSV row data
 * @returns {Object|null} Transformed training entry or null if invalid
 */
const transformCsvRowToTraining = (csvRow) => {
  const timestamp = parseInt(csvRow['Timestamp']);
  const userId = csvRow['User ID'];
  const manualLabour = parseInt(csvRow['Manual Labour Gained']) || 0;
  const intelligence = parseInt(csvRow['Intelligence Gained']) || 0;
  const endurance = parseInt(csvRow['Endurance Gained']) || 0;
  const position = csvRow['Position'];
  const logKey = csvRow['logKey'];
  
  // Skip invalid rows
  if (!timestamp || !userId) {
    return null;
  }
  
  const date = timestampToDate(timestamp);
  const employee = mapUserIdToEmployee(userId);
  
  // Skip if we can't map the user to an employee
  if (!employee) {
    return null;
  }
  
  return {
    id: logKey || `log_${timestamp}_${userId}`,
    date: date.toISOString().split('T')[0],
    timestamp: date.toISOString(),
    employeeName: employee.name,
    employeeTornId: employee.tornId,
    position: position || employee.position,
    manualLabourGained: manualLabour,
    intelligenceGained: intelligence,
    enduranceGained: endurance,
    totalTrains: 1 // Each CSV row represents 1 train
  };
};

/**
 * Load and parse all training data from CSV file
 * @returns {Promise<Array>} Array of all training entries
 */
const loadAllTrainingData = async () => {
  try {
    // Read the CSV file
    const csvData = await window.fs.readFile('mockLogs.csv', { encoding: 'utf8' });
    
    // Parse CSV with Papa Parse
    const parseResult = Papa.parse(csvData, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';']
    });
    
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing errors:', parseResult.errors);
    }
    
    // Transform data
    const transformedData = parseResult.data
      .map(transformCsvRowToTraining)
      .filter(entry => entry !== null) // Remove invalid entries
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Most recent first
    
    console.log(`Loaded ${transformedData.length} training entries from CSV`);
    return transformedData;
    
  } catch (error) {
    console.error('Error loading training data from CSV:', error);
    return [];
  }
};

/**
 * Calculate training statistics for a specific employee
 * @param {Array} trainingData - All training data
 * @param {string} employeeName - Employee name to filter by
 * @param {number} totalTrainsPurchased - Total trains purchased for this employee
 * @returns {Object} Training statistics
 */
const calculateEmployeeStats = (trainingData, employeeName, totalTrainsPurchased) => {
  // Filter data for specific employee
  const employeeData = trainingData.filter(entry => entry.employeeName === employeeName);
  
  // Calculate total trains received
  const totalTrainsReceived = employeeData.length;
  
  // Calculate trains remaining
  const trainsRemaining = Math.max(0, totalTrainsPurchased - totalTrainsReceived);
  
  // Calculate total stat gains
  const totalStatGains = employeeData.reduce((totals, entry) => {
    totals.manualLabour += entry.manualLabourGained;
    totals.intelligence += entry.intelligenceGained;
    totals.endurance += entry.enduranceGained;
    return totals;
  }, { manualLabour: 0, intelligence: 0, endurance: 0 });
  
  // Calculate 2-week average for days remaining calculation
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentData = employeeData.filter(entry => 
    new Date(entry.date) >= twoWeeksAgo
  );
  
  const recentTrainsCount = recentData.length;
  const averageTrainsPerDay = recentTrainsCount / 14; // 14 days
  const daysRemaining = averageTrainsPerDay > 0 ? trainsRemaining / averageTrainsPerDay : 0;
  
  return {
    totalTrainsReceived,
    trainsRemaining,
    totalStatGains,
    averageTrainsPerDay: parseFloat(averageTrainsPerDay.toFixed(1)),
    daysRemaining: parseFloat(daysRemaining.toFixed(1)),
    recentTrainsCount,
    lastUpdated: new Date()
  };
};

/**
 * Calculate company-wide training statistics
 * @param {Array} trainingData - All training data
 * @param {number} totalTrainsPurchased - Total trains purchased for the company
 * @returns {Object} Company training statistics
 */
const calculateCompanyStats = (trainingData, totalTrainsPurchased) => {
  // Calculate total trains given across all employees
  const totalTrainsGiven = trainingData.length;
  
  // Calculate trains remaining
  const trainsRemaining = Math.max(0, totalTrainsPurchased - totalTrainsGiven);
  
  // Calculate total stat gains across all employees
  const totalStatGains = trainingData.reduce((totals, entry) => {
    totals.manualLabour += entry.manualLabourGained;
    totals.intelligence += entry.intelligenceGained;
    totals.endurance += entry.enduranceGained;
    return totals;
  }, { manualLabour: 0, intelligence: 0, endurance: 0 });
  
  // Calculate 2-week average
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentData = trainingData.filter(entry => 
    new Date(entry.date) >= twoWeeksAgo
  );
  
  const recentTrainsCount = recentData.length;
  const averageTrainsPerDay = recentTrainsCount / 14;
  const daysRemaining = averageTrainsPerDay > 0 ? trainsRemaining / averageTrainsPerDay : 0;
  
  // Calculate breakdown by employee
  const employeeBreakdown = {};
  trainingData.forEach(entry => {
    if (!employeeBreakdown[entry.employeeName]) {
      employeeBreakdown[entry.employeeName] = {
        trainsReceived: 0,
        statGains: { manualLabour: 0, intelligence: 0, endurance: 0 }
      };
    }
    employeeBreakdown[entry.employeeName].trainsReceived += 1;
    employeeBreakdown[entry.employeeName].statGains.manualLabour += entry.manualLabourGained;
    employeeBreakdown[entry.employeeName].statGains.intelligence += entry.intelligenceGained;
    employeeBreakdown[entry.employeeName].statGains.endurance += entry.enduranceGained;
  });
  
  return {
    totalTrainsGiven,
    trainsRemaining,
    totalStatGains,
    averageTrainsPerDay: parseFloat(averageTrainsPerDay.toFixed(1)),
    daysRemaining: parseFloat(daysRemaining.toFixed(1)),
    recentTrainsCount,
    employeeBreakdown,
    lastUpdated: new Date()
  };
};

/**
 * Custom hook for CSV-based training calculations
 * @param {string} employeeName - Employee name to filter by (optional, for client dashboard)
 * @param {number} totalTrainsPurchased - Total trains purchased
 * @param {boolean} autoRefresh - Whether to auto-refresh data
 * @returns {Object} Training calculations and utilities
 */
export const useCsvTrainingCalculations = (employeeName = null, totalTrainsPurchased = 900, autoRefresh = false) => {
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await loadAllTrainingData();
      setTrainingData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load training data');
      console.error('Error loading training data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadData, 5 * 60 * 1000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Calculate statistics based on whether we're filtering by employee or not
  const statistics = employeeName 
    ? calculateEmployeeStats(trainingData, employeeName, totalTrainsPurchased)
    : calculateCompanyStats(trainingData, totalTrainsPurchased);

  return {
    trainingData,
    statistics,
    loading,
    error,
    lastUpdated,
    refreshData: loadData,
    clearError: () => setError(null)
  };
};

export default useCsvTrainingCalculations;