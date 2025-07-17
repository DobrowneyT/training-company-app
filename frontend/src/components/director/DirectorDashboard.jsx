/**
 * Director Dashboard Component (Updated)
 * Main dashboard for company directors to manage their training company
 * Updated to use reorganized CompanyInfoCard and TrainingPlanCard
 * 
 * @file src/components/director/DirectorDashboard.jsx
 * @author Training Company App
 * @version 2.1.0 (Updated component integration and employee effectiveness)
 */

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import StatusBadge from '../common/StatusBadge';
import UserProfileButton from '../common/UserProfileButton';
import TrainingAnalytics from '../analytics/TrainingAnalytics';
import TrainingPlanCard from '../training/TrainingPlanCard';
import CompanyInfoCard from '../company/CompanyInfoCard';
import UnifiedLogin from '../auth/UnifiedLogin';
import { useCsvTrainingCalculations } from '../../hooks/useCsvTrainingCalculations';
import { 
  mockDirectorUser,
  bigBaddaBoomCompany,
  getCompanyEmployees,
  updateCompanyData 
} from '../../data/mockData';

/**
 * Calculate employee effectiveness based on work stats and position
 * @param {Object} employee - Employee data
 * @returns {string} Effectiveness rating (e.g., "85%", "Good", etc.)
 */
const calculateEmployeeEffectiveness = (employee) => {
  if (!employee.workStats) return 'N/A';
  
  const { manualLabor, intelligence, endurance } = employee.workStats;
  const total = manualLabor + intelligence + endurance;
  const average = total / 3;
  
  // Base effectiveness on average work stats and position
  let effectiveness = Math.floor((average / 50) * 100); // Assuming 5000 is high-end
  
  // Position modifiers
  switch (employee.position) {
    case 'Trainer':
      effectiveness += 10; // Trainers are more effective
      break;
    case 'Salesperson':
      effectiveness += 5;
      break;
    case 'Picker Packer':
      effectiveness += 3;
      break;
    default:
      break;
  }
  
  // Cap at 100%
  effectiveness = Math.min(effectiveness, 100);
  
  return `${effectiveness}%`;
};

/**
 * Hook to get director context or fallback to mock data with CSV calculations
 * @returns {Object} Director context data or mock data with real CSV calculations
 */
const useDirectorOrMock = () => {
  // Try to use real context first
  let contextData = null;
  try {
    const { useDirector } = require('../../context/DirectorContext');
    contextData = useDirector();
  } catch (error) {
    console.log('DirectorContext not available, using mock data');
  }

  // Get CSV-based training calculations for the entire company
  const csvCalculations = useCsvTrainingCalculations(
    null, // No employee filter - get company-wide stats
    bigBaddaBoomCompany.trainsBuyer.totalTrainsPurchased, // Total trains purchased
    true // Auto-refresh
  );

  // If context is not available or not authenticated, use mock data with CSV calculations
  if (!contextData || !contextData.isAuthenticated) {
    const updatedCompany = {
      ...bigBaddaBoomCompany,
      // Use real CSV calculations
      trainsGiven: csvCalculations.statistics.totalTrainsGiven || 0,
      trainsRemaining: csvCalculations.statistics.trainsRemaining || bigBaddaBoomCompany.trainsBuyer.totalTrainsPurchased,
      daysRemaining: csvCalculations.statistics.daysRemaining || 0,
      averageTrainsPerDay: csvCalculations.statistics.averageTrainsPerDay || 0,
      totalStatGains: csvCalculations.statistics.totalStatGains || { manualLabour: 0, intelligence: 0, endurance: 0 },
      employeeBreakdown: csvCalculations.statistics.employeeBreakdown || {},
      status: csvCalculations.statistics.trainsRemaining > 50 ? 'good' : 
              csvCalculations.statistics.trainsRemaining > 0 ? 'low' : 'critical'
    };

    return {
      director: mockDirectorUser,
      isAuthenticated: true,
      company: updatedCompany,
      loading: csvCalculations.loading,
      error: csvCalculations.error,
      lastUpdated: csvCalculations.lastUpdated || new Date(),
      isScrapingActive: false,
      startScraping: null,
      refreshData: csvCalculations.refreshData,
      logout: () => console.log('Mock logout'),
      clearError: csvCalculations.clearError
    };
  }

  return contextData;
};

/**
 * Detect OS color scheme
 * @returns {boolean} True if user prefers dark mode
 */
const detectOSColorScheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

/**
 * Dashboard Header Component
 * @param {Object} props - Component props
 * @param {string} props.title - Header title
 * @param {string} props.subtitle - Header subtitle
 * @param {Object} props.user - User data
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onToggleDarkMode - Dark mode toggle
 * @param {Function} props.onRefresh - Refresh handler
 * @param {Function} props.onLogout - Logout handler
 * @param {boolean} props.loading - Loading state
 * @param {Date} props.lastUpdated - Last update timestamp
 * @returns {JSX.Element} Header component
 */
const DashboardHeader = ({ 
  title, 
  subtitle, 
  user, 
  darkMode, 
  onToggleDarkMode, 
  onRefresh, 
  onLogout, 
  loading, 
  lastUpdated 
}) => (
  <header className={`shadow-sm border-b transition-colors ${
    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
  }`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-6">
        <div>
          <h1 className={`text-3xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`mt-2 text-sm ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                : darkMode 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
          <UserProfileButton 
            user={user} 
            darkMode={darkMode} 
            onLogout={onLogout}
          />
        </div>
      </div>
      {lastUpdated && (
        <div className={`pb-2 text-xs ${
          darkMode ? 'text-slate-400' : 'text-gray-500'
        }`}>
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  </header>
);

/**
 * Stats Card Component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value
 * @param {string} props.subtitle - Optional subtitle
 * @param {string} props.icon - Icon type
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Stats card component
 */
const StatsCard = ({ title, value, subtitle, icon, darkMode, onClick }) => {
  const iconComponents = {
    employees: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    trains: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    revenue: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div 
      className={`rounded-xl shadow-lg border p-6 transition-colors ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } ${onClick ? 'cursor-pointer hover:shadow-xl' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="text-blue-600">
          {iconComponents[icon]}
        </div>
      </div>
    </div>
  );
};

/**
 * Employee List Component (Updated with Employee Effectiveness)
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Array} props.employees - Employee list
 * @returns {JSX.Element} Employee list component
 */
const EmployeeList = ({ darkMode, employees }) => (
  <div className={`rounded-xl shadow-lg border p-6 ${
    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
  }`}>
    <div className="flex items-center justify-between mb-6">
      <h2 className={`text-xl font-semibold ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Company Employees
      </h2>
      <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
        Export
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`border-b ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <th className={`text-left py-3 px-4 font-medium ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>Employee [ID]</th>
            <th className={`text-left py-3 px-4 font-medium ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>Position</th>
            <th className={`text-left py-3 px-4 font-medium ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>Employee Effectiveness</th>
            <th className={`text-left py-3 px-4 font-medium ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className={`border-b ${
              darkMode ? 'border-slate-700' : 'border-gray-100'
            }`}>
              <td className={`py-3 px-4 font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {employee.name} <span className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>[{employee.tornId}]</span>
              </td>
              <td className={`py-3 px-4 ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                {employee.position}
              </td>
              <td className={`py-3 px-4 font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {calculateEmployeeEffectiveness(employee)}
              </td>
              <td className="py-3 px-4">
                <StatusBadge 
                  status={employee.status}
                  size="sm"
                  darkMode={darkMode}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Recent Training Activity Component
 * Shows recent training activity from CSV data (most recent 10 logs)
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Array} props.trainingData - Training data from CSV
 * @returns {JSX.Element} Activity log component
 */
const RecentTrainingActivity = ({ darkMode, trainingData = [] }) => {
  // Get the most recent 10 training entries
  const recentLogs = trainingData.slice(0, 10);

  return (
    <div className={`rounded-xl shadow-lg border p-6 ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Recent Training Activity
        </h2>
        <button className="bg-gray-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {recentLogs.length > 0 ? (
          recentLogs.map((log) => (
            <div key={log.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
              darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-medium truncate ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {log.employeeName}
                  </span>
                  <span className={`text-xs ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${
                  darkMode ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Training completed: +{log.manualLabourGained}/{log.intelligenceGained}/{log.enduranceGained}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    darkMode ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {log.position}
                  </span>
                  <span className={`text-xs ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-8 ${
            darkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            No recent training activity found
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main DirectorDashboard Component
 * @returns {JSX.Element} The director dashboard
 */
const DirectorDashboard = () => {
  const directorData = useDirectorOrMock();
  
  const [darkMode, setDarkMode] = useState(() => detectOSColorScheme());
  const [localLastUpdated, setLocalLastUpdated] = useState(new Date());

  // Get CSV training data for recent activity
  const csvTrainingData = useCsvTrainingCalculations(null, 900, false);

  // Listen for OS color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Show login if not authenticated
  if (!directorData.isAuthenticated) {
    return <UnifiedLogin />;
  }

  // Use mock data for development (replace with real data from context)
  const companyData = directorData.company;
  const userData = directorData.director;
  const employees = getCompanyEmployees(companyData.id);

  // Prepare stats data using real CSV-calculated analytics
  const statsData = [
    {
      title: 'Employees',
      value: companyData.employeeCount,
      subtitle: 'Active employees',
      icon: 'employees'
    },
    {
      title: 'Trains Given',
      value: companyData.trainsGiven || 0,
      subtitle: 'From training logs',
      icon: 'trains'
    },
    {
      title: 'Trains Remaining',
      value: companyData.trainsRemaining || 0,
      subtitle: `~${companyData.daysRemaining || 0} days left`,
      icon: 'trains'
    },
    {
      title: 'Company Bank',
      value: `${(companyData.companyBank / 1000000).toFixed(1)}M`,
      subtitle: 'Available funds',
      icon: 'revenue'
    }
  ];

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleStartScraping = () => {
    if (directorData.startScraping) {
      directorData.startScraping();
    } else {
      // Mock implementation for development
      console.log('Starting scraping...');
      
      // Simulate scraping by updating company data
      setTimeout(() => {
        updateCompanyData(companyData.id, {
          lastScraped: new Date(),
          companyBank: companyData.companyBank + Math.floor(Math.random() * 1000000)
        });
        setLocalLastUpdated(new Date());
      }, 2000);
    }
  };

  const handleRefresh = () => {
    if (directorData.refreshData) {
      directorData.refreshData();
    } else {
      // Mock implementation for development
      console.log('Refreshing data...');
      setLocalLastUpdated(new Date());
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Header */}
      <DashboardHeader
        title={companyData.name}
        subtitle="Company Director Dashboard"
        user={userData}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onRefresh={handleRefresh}
        onLogout={directorData.logout}
        loading={directorData.loading}
        lastUpdated={directorData.lastUpdated || localLastUpdated}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {directorData.error && (
          <div className={`mb-6 p-4 rounded-lg border ${
            darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              <svg className={`w-5 h-5 mt-0.5 mr-3 ${
                darkMode ? 'text-red-400' : 'text-red-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className={`text-sm font-medium mb-1 ${
                  darkMode ? 'text-red-300' : 'text-red-800'
                }`}>
                  Error
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-red-400' : 'text-red-700'
                }`}>
                  {directorData.error}
                </p>
                <button onClick={directorData.clearError} className={`mt-2 text-xs underline ${
                  darkMode ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-500'
                }`}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              darkMode={darkMode}
            />
          ))}
        </div>

        {/* Company Info and Training Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CompanyInfoCard 
            darkMode={darkMode}
            company={companyData}
            onStartScraping={handleStartScraping}
            isScrapingActive={directorData.isScrapingActive}
          />
          <TrainingPlanCard 
            darkMode={darkMode}
            company={companyData}
            trainingData={{
              totalTrainsPurchased: companyData.totalTrainsPurchased || companyData.trainsBuyer?.totalTrainsPurchased || 900,
              currentStat: companyData.trainsBuyer?.currentStat || 'Manual Labor',
              targetLevel: companyData.trainsBuyer?.targetLevel || null,
              currentLevel: companyData.trainsBuyer?.currentLevel || null,
              notes: companyData.trainsBuyer?.notes || null,
              trainsReceived: companyData.trainsGiven || 0,
              trainsRemaining: companyData.trainsRemaining || 0,
              daysRemaining: companyData.daysRemaining || 0,
              averageTrainsPerDay: companyData.averageTrainsPerDay || 0
            }}
            title="Current Training Plan"
          />
        </div>

        {/* Employees and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EmployeeList 
            darkMode={darkMode}
            employees={employees}
          />
          <RecentTrainingActivity 
            darkMode={darkMode} 
            trainingData={csvTrainingData.trainingData || []}
          />
        </div>

        {/* Training Analytics - Full Width, CSV-based */}
        <div className="mb-8">
          <TrainingAnalytics
            companyId={companyData.id}
            darkMode={darkMode}
            loading={directorData.loading}
            title="Company Training Analytics"
          />
        </div>
      </main>
    </div>
  );
};

export default DirectorDashboard;