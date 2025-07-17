/**
 * Training Analytics Component - Reusable analytics for training data
 * Shows daily train counts, averages, and custom date range selection
 * Now reads data directly from mockLogs.csv file
 * 
 * @file src/components/analytics/TrainingAnalytics.jsx
 * @author Training Company App
 * @version 3.0.0 (Updated to use CSV data source)
 */

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import LoadingSpinner from '../common/LoadingSpinner';
import { bigBaddaBoomEmployees } from '../../data/mockData';

/**
 * Convert Unix timestamp to Date object
 * @param {number} timestamp - Unix timestamp
 * @returns {Date} JavaScript Date object
 */
const timestampToDate = (timestamp) => {
  return new Date(timestamp * 1000);
};

/**
 * Convert Date to YYYY-MM-DD string
 * @param {Date} date - JavaScript Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
const dateToString = (date) => {
  return date.toISOString().split('T')[0];
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
 * Determine primary training stat based on gains
 * @param {number} manualLabour - Manual labour gained
 * @param {number} intelligence - Intelligence gained  
 * @param {number} endurance - Endurance gained
 * @returns {string} Primary stat being trained
 */
const determinePrimaryStat = (manualLabour, intelligence, endurance) => {
  const gains = {
    'Manual Labor': manualLabour,
    'Intelligence': intelligence,
    'Endurance': endurance
  };
  
  // Find the stat with the highest gain (should be 50 for primary, 25 for secondary)
  const maxGain = Math.max(manualLabour, intelligence, endurance);
  
  for (const [stat, gain] of Object.entries(gains)) {
    if (gain === maxGain) {
      return stat;
    }
  }
  
  return 'Manual Labor'; // Default fallback
};

/**
 * Transform CSV row to training log entry
 * @param {Object} csvRow - Raw CSV row data
 * @returns {Object|null} Transformed training log entry or null if invalid
 */
const transformCsvRowToLog = (csvRow) => {
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
  
  const primaryStat = determinePrimaryStat(manualLabour, intelligence, endurance);
  
  return {
    id: logKey || `log_${timestamp}_${userId}`,
    date: dateToString(date),
    timestamp: date.toISOString(),
    employeeName: employee.name,
    employeeTornId: employee.tornId,
    position: position || employee.position,
    trainsGiven: 1, // Each CSV row represents 1 train
    stat: primaryStat,
    manualLabourGained: manualLabour,
    intelligenceGained: intelligence,
    enduranceGained: endurance,
    notes: `Training session - ${primaryStat} (+${manualLabour}/${intelligence}/${endurance})`,
    loggedBy: 'System',
    companyId: 'big-badda-boom'
  };
};

/**
 * Load and parse training logs from CSV file
 * @param {number} days - Number of days to retrieve (default: 30)
 * @returns {Promise<Array>} Array of training log entries
 */
const loadTrainingLogsFromCsv = async (days = 30) => {
  try {
    const response = await fetch('/mockLogs.csv');
    const csvText = await response.text();

    const parseResult = Papa.parse(csvText, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';']
    });
    
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing errors:', parseResult.errors);
    }
    
    // Transform and filter data
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const transformedLogs = parseResult.data
      .map(transformCsvRowToLog)
      .filter(log => log !== null) // Remove invalid entries
      .filter(log => new Date(log.date) >= cutoffDate) // Filter by date range
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Most recent first
    
    console.log(`Loaded ${transformedLogs.length} training logs from CSV`);
    return transformedLogs;
    
  } catch (error) {
    console.error('Error loading training logs from CSV:', error);
    return [];
  }
};

/**
 * Calculate total trains given from logs
 * @param {Array} logs - Training logs array
 * @param {string} employeeName - Name of employee to filter by (optional)
 * @returns {number} Total trains given
 */
export const calculateTrainsGiven = (logs, employeeName = null) => {
  const filteredLogs = employeeName 
    ? logs.filter(log => log.employeeName === employeeName)
    : logs;
  
  return filteredLogs.reduce((total, log) => total + (log.trainsGiven || 0), 0);
};

/**
 * Calculate average trains per day
 * @param {Array} logs - Training logs array
 * @param {number} days - Number of days to calculate over (default: 30)
 * @returns {number} Average trains per day
 */
export const calculateAverageTrainsPerDay = (logs, days = 30) => {
  const totalTrains = calculateTrainsGiven(logs);
  const activeDays = [...new Set(logs.map(log => log.date))].length; // Unique days with training
  return activeDays > 0 ? totalTrains / activeDays : 0;
};

/**
 * Calculate days remaining based on current pace
 * @param {number} trainsRemaining - Number of trains remaining
 * @param {Array} logs - Training logs array
 * @returns {number} Days remaining at current pace
 */
export const calculateDaysRemaining = (trainsRemaining, logs) => {
  const avgPerDay = calculateAverageTrainsPerDay(logs);
  return avgPerDay > 0 ? trainsRemaining / avgPerDay : 0;
};

/**
 * Calculate trains remaining for a specific employee
 * @param {number} totalPurchased - Total trains purchased
 * @param {Array} logs - Training logs array
 * @param {string} employeeName - Employee name
 * @returns {number} Trains remaining
 */
export const calculateTrainsRemaining = (totalPurchased, logs, employeeName) => {
  const trainsGiven = calculateTrainsGiven(logs, employeeName);
  return Math.max(0, totalPurchased - trainsGiven);
};

/**
 * Convert training logs to analytics format grouped by date
 * @param {Array} logs - Training logs array
 * @returns {Array} Array of analytics data objects
 */
const convertLogsToAnalyticsData = (logs) => {
  // Group logs by date and sum trains given
  const groupedByDate = logs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        trainsReceived: 0,
        stat: log.stat,
        sessions: []
      };
    }
    acc[date].trainsReceived += log.trainsGiven || 0;
    acc[date].sessions.push(log);
    return acc;
  }, {});

  // Convert to array and sort by date (most recent first)
  return Object.values(groupedByDate).sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Date Range Selector Component
 * @param {Object} props - Component props
 * @param {Date} props.startDate - Start date
 * @param {Date} props.endDate - End date
 * @param {Function} props.onDateChange - Date change handler
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Array} props.csvData - CSV data to find oldest timestamp
 * @returns {JSX.Element} Date range selector
 */
const DateRangeSelector = ({ startDate, endDate, onDateChange, darkMode, csvData = [] }) => {
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e) => {
    const newStartDate = new Date(e.target.value);
    if (newStartDate <= endDate) {
      onDateChange(newStartDate, endDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = new Date(e.target.value);
    if (newEndDate >= startDate) {
      onDateChange(startDate, newEndDate);
    }
  };

  const setPresetRange = (days) => {
    const newEndDate = new Date();
    const newStartDate = new Date();
    newStartDate.setDate(newStartDate.getDate() - days + 1);
    onDateChange(newStartDate, newEndDate);
  };

  const setAllTimeRange = () => {
    if (csvData.length === 0) {
      // Fallback to 90 days if no data
      setPresetRange(90);
      return;
    }

    // Find the oldest timestamp in the data
    const oldestEntry = csvData.reduce((oldest, current) => {
      return new Date(current.timestamp) < new Date(oldest.timestamp) ? current : oldest;
    }, csvData[0]);

    const oldestDate = new Date(oldestEntry.timestamp);
    const currentDate = new Date();
    
    onDateChange(oldestDate, currentDate);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex items-center gap-2">
        <label className={`text-sm font-medium ${
          darkMode ? 'text-slate-300' : 'text-gray-700'
        }`}>
          From:
        </label>
        <input
          type="date"
          value={formatDateForInput(startDate)}
          onChange={handleStartDateChange}
          className={`px-3 py-2 border rounded-lg text-sm ${
            darkMode 
              ? 'bg-slate-700 border-slate-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className={`text-sm font-medium ${
          darkMode ? 'text-slate-300' : 'text-gray-700'
        }`}>
          To:
        </label>
        <input
          type="date"
          value={formatDateForInput(endDate)}
          onChange={handleEndDateChange}
          className={`px-3 py-2 border rounded-lg text-sm ${
            darkMode 
              ? 'bg-slate-700 border-slate-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => setPresetRange(7)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setPresetRange(14)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          14 Days
        </button>
        <button
          onClick={() => setPresetRange(30)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setAllTimeRange()}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ALL
        </button>
      </div>
    </div>
  );
};

/**
 * Sortable Bar Chart Component with sorting controls
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data
 * @param {boolean} props.darkMode - Dark mode state
 * @param {string} props.sortOrder - Sort order ('desc' or 'asc')
 * @param {Function} props.onSortChange - Sort change handler
 * @returns {JSX.Element} Bar chart component
 */
const SortableBarChart = ({ data, darkMode, sortOrder, onSortChange }) => {
  const sortedData = useMemo(() => {
    const sorted = [...data];
    if (sortOrder === 'desc') {
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  }, [data, sortOrder]);

  const maxValue = Math.max(...sortedData.map(d => d.trainsReceived));
  
  return (
    <div>
      {/* Sort controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Daily Training History
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Sort:
          </span>
          <button
            onClick={() => onSortChange(sortOrder === 'desc' ? 'asc' : 'desc')}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              darkMode 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Date
            <svg 
              className={`w-4 h-4 transition-transform ${
                sortOrder === 'desc' ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-20 text-xs ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {new Date(item.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex-1 relative">
              <div className={`h-6 rounded ${
                darkMode ? 'bg-slate-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-full bg-blue-500 rounded transition-all duration-300"
                  style={{ width: `${maxValue > 0 ? (item.trainsReceived / maxValue) * 100 : 0}%` }}
                />
              </div>
              <div className={`absolute right-2 top-0 h-full flex items-center text-xs font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {item.trainsReceived}
              </div>
            </div>
            <div className={`w-16 text-xs text-right ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              {item.sessions.length} session{item.sessions.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Analytics Stats Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Training data
 * @param {boolean} props.darkMode - Dark mode state
 * @returns {JSX.Element} Analytics stats component
 */
const AnalyticsStats = ({ data, darkMode }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalTrains: 0,
        averagePerDay: 0,
        daysWithTraining: 0,
        mostProductiveDay: null
      };
    }

    const totalTrains = data.reduce((sum, item) => sum + item.trainsReceived, 0);
    const daysWithTraining = data.filter(item => item.trainsReceived > 0).length;
    const averagePerDay = daysWithTraining > 0 ? totalTrains / daysWithTraining : 0;
    
    const mostProductiveDay = data.reduce((max, item) => 
      item.trainsReceived > max.trainsReceived ? item : max, { trainsReceived: 0 }
    );

    return {
      totalTrains,
      averagePerDay: averagePerDay.toFixed(1),
      daysWithTraining,
      mostProductiveDay: mostProductiveDay.trainsReceived > 0 ? mostProductiveDay : null
    };
  }, [data]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-slate-700/50' : 'bg-blue-50'
      }`}>
        <div className={`text-2xl font-bold ${
          darkMode ? 'text-white' : 'text-blue-600'
        }`}>
          {stats.totalTrains}
        </div>
        <div className={`text-sm ${
          darkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          Total Trains
        </div>
      </div>
      
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-slate-700/50' : 'bg-green-50'
      }`}>
        <div className={`text-2xl font-bold ${
          darkMode ? 'text-white' : 'text-green-600'
        }`}>
          {stats.averagePerDay}
        </div>
        <div className={`text-sm ${
          darkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          Avg per Active Day
        </div>
      </div>
      
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-slate-700/50' : 'bg-purple-50'
      }`}>
        <div className={`text-2xl font-bold ${
          darkMode ? 'text-white' : 'text-purple-600'
        }`}>
          {stats.daysWithTraining}
        </div>
        <div className={`text-sm ${
          darkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          Active Days
        </div>
      </div>
      
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-slate-700/50' : 'bg-orange-50'
      }`}>
        <div className={`text-2xl font-bold ${
          darkMode ? 'text-white' : 'text-orange-600'
        }`}>
          {stats.mostProductiveDay?.trainsReceived || 0}
        </div>
        <div className={`text-sm ${
          darkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          Best Day
        </div>
      </div>
    </div>
  );
};

/**
 * Stat Breakdown Component - Shows total stat gains instead of train counts
 * @param {Object} props - Component props
 * @param {Array} props.logs - Training logs for breakdown calculation
 * @param {boolean} props.darkMode - Dark mode state
 * @returns {JSX.Element} Stat breakdown component
 */
const StatBreakdown = ({ logs, darkMode }) => {
  const statGains = useMemo(() => {
    const gains = { 'Manual Labor': 0, 'Intelligence': 0, 'Endurance': 0 };
    logs.forEach(log => {
      // Sum up the actual stat gains from the CSV data
      gains['Manual Labor'] += log.manualLabourGained || 0;
      gains['Intelligence'] += log.intelligenceGained || 0;
      gains['Endurance'] += log.enduranceGained || 0;
    });
    return gains;
  }, [logs]);

  const stats = [
    { name: 'Manual Labor', gains: statGains['Manual Labor'] || 0, color: 'bg-blue-500' },
    { name: 'Intelligence', gains: statGains['Intelligence'] || 0, color: 'bg-green-500' },
    { name: 'Endurance', gains: statGains['Endurance'] || 0, color: 'bg-purple-500' }
  ];

  const totalGains = stats.reduce((sum, stat) => sum + stat.gains, 0);

  return (
    <div className={`p-4 rounded-lg ${
      darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
    }`}>
      <h3 className={`text-sm font-medium mb-3 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Total Stat Gains
      </h3>
      <div className="space-y-2">
        {stats.map((stat) => (
          <div key={stat.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
              <span className={`text-sm ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                {stat.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                +{stat.gains.toLocaleString()}
              </span>
              <span className={`text-xs ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                ({totalGains > 0 ? Math.round((stat.gains / totalGains) * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Training Analytics Component
 * @param {Object} props - Component props
 * @param {string} props.companyId - Company ID to fetch data for (ignored for CSV source)
 * @param {boolean} props.darkMode - Dark mode state
 * @param {boolean} props.loading - Loading state (external loading)
 * @param {Function} props.onDateRangeChange - Date range change handler
 * @param {string} props.title - Component title
 * @param {string} props.employeeName - Filter by specific employee (optional)
 * @returns {JSX.Element} Training analytics component
 */
const TrainingAnalytics = ({ 
  companyId,
  darkMode = false, 
  loading: externalLoading = false, 
  onDateRangeChange,
  title = "Training Analytics",
  employeeName = null
}) => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 13); // Default to 14 days
    return date;
  });
  
  const [endDate, setEndDate] = useState(() => new Date());
  const [sortOrder, setSortOrder] = useState('desc'); // Most recent first by default
  const [csvData, setCsvData] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calculate days for data loading
  const daysToLoad = useMemo(() => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays + 30, 90); // Load extra data to ensure we have enough
  }, [startDate, endDate]);
  
  // Load CSV data when component mounts or date range changes significantly
  useEffect(() => {
    const loadCsvData = async () => {
      setInternalLoading(true);
      setError(null);
      
      try {
        const logs = await loadTrainingLogsFromCsv(daysToLoad);
        setCsvData(logs);
      } catch (err) {
        setError('Failed to load training data');
        console.error('Error loading CSV data:', err);
      } finally {
        setInternalLoading(false);
      }
    };
    
    loadCsvData();
  }, [daysToLoad]);
  
  // Filter logs based on date range and employee
  const filteredLogs = useMemo(() => {
    let filtered = csvData.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });
    
    // Filter by employee if specified
    if (employeeName) {
      filtered = filtered.filter(log => log.employeeName === employeeName);
    }
    
    return filtered;
  }, [csvData, startDate, endDate, employeeName]);
  
  // Convert logs to analytics format
  const analyticsData = useMemo(() => {
    return convertLogsToAnalyticsData(filteredLogs);
  }, [filteredLogs]);

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    if (onDateRangeChange) {
      onDateRangeChange(newStartDate, newEndDate);
    }
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
  };

  const isLoading = internalLoading || externalLoading;

  if (isLoading) {
    return (
      <div className={`rounded-xl shadow-lg border p-6 ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" color={darkMode ? 'white' : 'blue'} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl shadow-lg border p-6 ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-center py-12">
          <div className={`text-center ${
            darkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            <p className="font-medium">Error loading training data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-lg border p-6 ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
          {employeeName && (
            <span className={`text-sm font-normal ml-2 ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              - {employeeName}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {analyticsData.length} days
          </span>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateRangeChange}
          darkMode={darkMode}
          csvData={csvData}
        />
      </div>

      {/* Analytics Stats */}
      <div className="mb-6">
        <AnalyticsStats data={analyticsData} darkMode={darkMode} />
      </div>

      {/* Stat Breakdown */}
      <div className="mb-6">
        <StatBreakdown 
          logs={filteredLogs} 
          darkMode={darkMode} 
        />
      </div>

      {/* Sortable Chart */}
      <div>
        {analyticsData.length > 0 ? (
          <SortableBarChart 
            data={analyticsData} 
            darkMode={darkMode} 
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        ) : (
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Daily Training History
            </h3>
            <div className={`text-center py-8 ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              No training data available for the selected date range.
            </div>
          </div>
        )}
      </div>

      {/* Additional Analytics Info */}
      {filteredLogs.length > 0 && (
        <div className={`mt-6 pt-6 border-t ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {calculateAverageTrainsPerDay(filteredLogs).toFixed(1)}
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Average per Active Day
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {[...new Set(filteredLogs.map(log => log.date))].length}
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Active Training Days
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {calculateTrainsGiven(filteredLogs)}
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Total Trains Given
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingAnalytics;