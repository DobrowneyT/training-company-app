/**
 * Client Dashboard Component
 * Dashboard for trains buyers to view their training progress and request more trains
 * Updated to use CSV-based training analytics
 * 
 * @file src/components/client/ClientDashboard.jsx
 * @author Training Company App
 * @version 2.0.0 (Updated to use CSV data source)
 */

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import StatusBadge from '../common/StatusBadge';
import UserProfileButton from '../common/UserProfileButton';
import TrainingAnalytics from '../analytics/TrainingAnalytics';
import TrainingPlanCard from '../training/TrainingPlanCard';
import TrainingCalculator from '../training/TrainingCalculator';
import UnifiedLogin from '../auth/UnifiedLogin';
import useCsvTrainingCalculations from '../../hooks/useCsvTrainingCalculations';
import { 
  mockClientUser,
  bigBaddaBoomCompany
} from '../../data/mockData';

/**
 * Hook to get client context or fallback to mock data with CSV calculations
 * @returns {Object} Client context data or mock data with real CSV calculations
 */
const useClientOrMock = () => {
  // Try to use real context first
  let contextData = null;
  try {
    const { useClient } = require('../../context/ClientContext');
    contextData = useClient();
  } catch (error) {
    console.log('ClientContext not available, using mock data');
  }

  // Get CSV-based training calculations for the client
  const csvCalculations = useCsvTrainingCalculations(
    'Manchineel', // Employee name
    bigBaddaBoomCompany.trainsBuyer.totalTrainsPurchased, // Total trains purchased
    true // Auto-refresh
  );

  // If context is not available or not authenticated, use mock data with CSV calculations
  if (!contextData || !contextData.isAuthenticated) {
    return {
      client: mockClientUser,
      isAuthenticated: true,
      companyInfo: bigBaddaBoomCompany,
      trainingData: {
        ...bigBaddaBoomCompany.trainsBuyer,
        // Use real CSV calculations
        trainsReceived: csvCalculations.statistics.totalTrainsReceived || 0,
        trainsRemaining: csvCalculations.statistics.trainsRemaining || bigBaddaBoomCompany.trainsBuyer.totalTrainsPurchased,
        daysRemaining: csvCalculations.statistics.daysRemaining || 0,
        averageTrainsPerDay: csvCalculations.statistics.averageTrainsPerDay || 0,
        totalStatGains: csvCalculations.statistics.totalStatGains || { manualLabour: 0, intelligence: 0, endurance: 0 }
      },
      loading: csvCalculations.loading,
      error: csvCalculations.error,
      lastUpdated: csvCalculations.lastUpdated || new Date(),
      requestingTrains: false,
      requestTrains: null,
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
 * Training Stats Card Component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value
 * @param {string} props.subtitle - Optional subtitle
 * @param {string} props.icon - Icon type
 * @param {boolean} props.darkMode - Dark mode state
 * @param {string} props.color - Color theme
 * @returns {JSX.Element} Stats card component
 */
const TrainingStatsCard = ({ title, value, subtitle, icon, darkMode, color = 'blue' }) => {
  const iconComponents = {
    trains: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    level: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    rate: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <div className={`rounded-xl shadow-lg border p-6 transition-colors ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
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
        <div className={colorClasses[color]}>
          {iconComponents[icon]}
        </div>
      </div>
    </div>
  );
};

/**
 * Request Trains Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSubmit - Submit handler
 * @param {boolean} props.darkMode - Dark mode state
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} Request trains modal
 */
const RequestTrainsModal = ({ isOpen, onClose, onSubmit, darkMode, loading }) => {
  const [formData, setFormData] = useState({
    stat: 'Manual Labor',
    quantity: 10,
    targetLevel: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md rounded-xl shadow-2xl ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Request Training
            </h2>
            <button
              onClick={onClose}
              className={`text-gray-500 hover:text-gray-700 ${
                darkMode ? 'hover:text-gray-300' : ''
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Training Stat
              </label>
              <select
                name="stat"
                value={formData.stat}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="Manual Labor">Manual Labor</option>
                <option value="Intelligence">Intelligence</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Number of Trains
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max="100"
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Target Level (Optional)
              </label>
              <input
                type="number"
                name="targetLevel"
                value={formData.targetLevel}
                onChange={handleChange}
                placeholder="e.g., 5000"
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Additional notes or requirements..."
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2 px-4 border rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Submitting...
                  </div>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Current Training Card Component
 * @param {Object} props - Component props
 * @param {Object} props.trainingData - Training data
 * @param {Object} props.companyInfo - Company information
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onRequestTrains - Request trains handler
 * @returns {JSX.Element} Current training card
 */
const CurrentTrainingCard = ({ trainingData, companyInfo, darkMode, onRequestTrains }) => {
  const progressPercentage = trainingData.targetLevel 
    ? ((trainingData.currentLevel / trainingData.targetLevel) * 100).toFixed(1)
    : 0;

  return (
    <div className={`rounded-xl shadow-lg border p-6 ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Current Training
        </h2>
        <StatusBadge 
          status={trainingData.trainsRemaining > 0 ? 'active' : 'completed'}
          size="md"
          darkMode={darkMode}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Company:</span>
          <span className={`font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {companyInfo.name}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Director:</span>
          <span className={`font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {companyInfo.director.name}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Training Stat:</span>
          <span className={`font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {trainingData.currentStat}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Rate per Train:</span>
          <span className={`font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ${companyInfo.rate.toLocaleString()}
          </span>
        </div>

        {trainingData.targetLevel && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Progress:</span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {trainingData.currentLevel.toLocaleString()} / {trainingData.targetLevel.toLocaleString()}
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${
              darkMode ? 'bg-slate-700' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className={`text-xs mt-1 ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              {progressPercentage}% complete
            </div>
          </div>
        )}

        {trainingData.notes && (
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-slate-700/50' : 'bg-blue-50'
          }`}>
            <p className={`text-sm ${
              darkMode ? 'text-slate-300' : 'text-blue-700'
            }`}>
              <strong>Notes:</strong> {trainingData.notes}
            </p>
          </div>
        )}

        <button
          onClick={onRequestTrains}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Request More Trains
        </button>
      </div>
    </div>
  );
};

/**
 * CSV-based Stats Card Component
 * Shows real calculated values from CSV data
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.trainingData - Training data with CSV calculations
 * @returns {JSX.Element} Stats grid component
 */
const CsvBasedStatsCards = ({ darkMode, trainingData }) => {
  const statsData = [
    {
      title: 'Total Purchased',
      value: trainingData.totalTrainsPurchased,
      subtitle: 'Trains purchased',
      icon: 'trains',
      color: 'blue'
    },
    {
      title: 'Trains Received',
      value: trainingData.trainsReceived,
      subtitle: 'From training logs',
      icon: 'trains',
      color: 'green'
    },
    {
      title: 'Trains Remaining',
      value: trainingData.trainsRemaining,
      subtitle: `~${trainingData.daysRemaining} days left`,
      icon: 'trains',
      color: 'orange'
    },
    {
      title: 'Current Level',
      value: trainingData.currentLevel?.toLocaleString() || 'N/A',
      subtitle: trainingData.currentStat,
      icon: 'level',
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <TrainingStatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
};

/**
 * Main ClientDashboard Component
 * @returns {JSX.Element} The client dashboard
 */
const ClientDashboard = () => {
  const clientData = useClientOrMock();
  
  const [darkMode, setDarkMode] = useState(() => detectOSColorScheme());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [localLastUpdated, setLocalLastUpdated] = useState(new Date());

  // Listen for OS color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Show login if not authenticated
  if (!clientData.isAuthenticated) {
    return <UnifiedLogin />;
  }

  const userData = { 
    username: clientData.client.name, 
    role: 'Trains Buyer', 
    tornId: clientData.client.tornId 
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleRequestTrains = (requestData) => {
    console.log('Requesting trains:', requestData);
    
    // Simulate API call
    if (clientData.requestTrains) {
      clientData.requestTrains(requestData);
    } else {
      // Mock implementation for development
      setTimeout(() => {
        console.log('Training request submitted successfully');
        setLocalLastUpdated(new Date());
      }, 1000);
    }
    
    setShowRequestModal(false);
  };

  const handleRefresh = () => {
    if (clientData.refreshData) {
      clientData.refreshData();
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
        title="Training Dashboard"
        subtitle="Trains Buyer Portal"
        user={userData}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onRefresh={handleRefresh}
        onLogout={clientData.logout}
        loading={clientData.loading}
        lastUpdated={clientData.lastUpdated || localLastUpdated}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {clientData.error && (
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
                  {clientData.error}
                </p>
                <button onClick={clientData.clearError} className={`mt-2 text-xs underline ${
                  darkMode ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-500'
                }`}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV-based Stats Grid */}
        <CsvBasedStatsCards 
          darkMode={darkMode}
          trainingData={clientData.trainingData}
        />

        {/* Quick Actions */}
        <div className="mb-8">
          <div className={`rounded-xl shadow-lg border p-6 ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Quick Actions
                </h2>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Manage your training requests and plan
                </p>
              </div>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Request More Trains
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Current Training Plan Card */}
          <div className="lg:col-span-1">
            <TrainingPlanCard 
              trainingData={clientData.trainingData}
              darkMode={darkMode}
              title="Current Training Plan"
            />
          </div>

          {/* Training Analytics */}
          <div className="lg:col-span-2">
            <TrainingAnalytics
              companyId={clientData.companyInfo.id}
              employeeName={clientData.client.name}
              darkMode={darkMode}
              loading={clientData.loading}
              title="Training Analytics"
            />
          </div>
        </div>

        {/* Training Calculator - Full Width */}
        <div className="mb-8">
          <TrainingCalculator
            darkMode={darkMode}
            currentStats={{
              manualLabor: clientData.trainingData.currentLevel || 50000,
              intelligence: 25000, // Mock data
              endurance: 10000     // Mock data
            }}
          />
        </div>
      </main>

      {/* Request Trains Modal */}
      <RequestTrainsModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleRequestTrains}
        darkMode={darkMode}
        loading={clientData.requestingTrains}
      />
    </div>
  );
};

export default ClientDashboard;