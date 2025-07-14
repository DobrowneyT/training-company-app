/**
 * Refined Professional Client Dashboard - Clean design inspired by reference site
 * Removes oversized elements and focuses on functionality
 * 
 * @file src/pages/ClientDashboard.jsx
 * @author Training Company App
 * @version 4.0.0 (Reference-Inspired)
 */

import React, { useState, useEffect } from 'react';
import { useClient } from '../context/ClientContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Professional Login Form (Reference Site Inspired)
 */
const ProfessionalLoginForm = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { verifyApiKey, error, clearError, loading } = useClient();

  const handleApiKeyChange = (e) => {
    const value = e.target.value.trim();
    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    setApiKey(filteredValue);
    
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (apiKey.length !== 16) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await verifyApiKey(apiKey);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = apiKey.length === 16 && !isSubmitting && !loading;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Login
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your Torn API key to access the training booking system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-3">
              Enter your API Key:
            </label>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="apiKey"
                name="apiKey"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder=""
                maxLength={16}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isSubmitting || loading}
                autoComplete="off"
                spellCheck="false"
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none transition-colors"
                disabled={isSubmitting || loading}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`
              w-full py-3 px-4 rounded font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800
              ${isFormValid
                ? 'bg-white text-slate-900 hover:bg-slate-100'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting || loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="gray" className="mr-2" />
                Verifying...
              </div>
            ) : (
              'Submit'
            )}
          </button>
        </form>

        {/* Additional Options */}
        <div className="mt-6 space-y-3">
          <button className="w-full py-2 px-4 border border-slate-600 rounded text-slate-300 hover:bg-slate-700 transition-colors text-sm">
            Register a Company
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="https://www.torn.com/preferences.php#tab=api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-300 text-xs transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
};

/**
 * Minimalist Dashboard Header
 */
const MinimalistHeader = ({ user, onRefresh, onLogout, loading }) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <h1 className="text-xl font-bold">Training Dashboard</h1>
              <p className="text-slate-400 text-sm">{user?.name} • ID: {user?.tornId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded hover:border-slate-500 transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            <button
              onClick={onLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded hover:border-slate-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Clean Training Assignment Card
 */
const CleanTrainingCard = ({ training }) => {
  if (!training) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="md" color="white" />
        </div>
      </div>
    );
  }

  const { currentStat, trainsRemaining, targetLevel, notes } = training;
  const hasAssignment = currentStat && currentStat !== 'Not Assigned';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded p-6">
      <h2 className="text-white font-semibold mb-4">Training Assignment</h2>
      
      {hasAssignment ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-2">{currentStat}</div>
            <div className="text-3xl font-bold text-blue-400 mb-1">{trainsRemaining}</div>
            <div className="text-slate-400 text-sm">sessions remaining</div>
          </div>
          
          {targetLevel && (
            <div className="bg-slate-700/50 rounded p-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Target Level:</span>
                <span className="text-white font-medium">{targetLevel.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          {notes && notes !== 'No training assignment' && (
            <div className="bg-blue-900/30 border border-blue-700/50 rounded p-3">
              <div className="text-blue-300 text-sm">{notes}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-yellow-400 mb-2">⚠</div>
          <div className="text-white font-medium mb-1">No Assignment</div>
          <div className="text-slate-400 text-sm">Contact your trainer</div>
        </div>
      )}
    </div>
  );
};

/**
 * Clean Work Statistics Card
 */
const CleanStatsCard = ({ currentStats }) => {
  if (!currentStats) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="md" color="white" />
        </div>
      </div>
    );
  }

  const stats = [
    { name: 'Manual Labor', value: currentStats.manual_labor, color: 'text-orange-400' },
    { name: 'Intelligence', value: currentStats.intelligence, color: 'text-blue-400' },
    { name: 'Endurance', value: currentStats.endurance, color: 'text-green-400' }
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded p-6">
      <h2 className="text-white font-semibold mb-4">Work Statistics</h2>
      
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.name} className="flex justify-between items-center">
            <span className="text-slate-400">{stat.name}:</span>
            <span className={`font-semibold ${stat.color}`}>
              {stat.value?.toLocaleString() || '0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Professional Dashboard
 */
const ProfessionalDashboard = () => {
  const {
    user,
    isAuthenticated,
    training,
    currentStats,
    lastUpdated,
    loading,
    error,
    refreshData,
    logout,
    clearError
  } = useClient();

  const [autoRefresh, setAutoRefresh] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('ProfessionalDashboard render:', {
      user,
      isAuthenticated,
      training,
      currentStats,
      loading,
      error
    });
  }, [user, isAuthenticated, training, currentStats, loading, error]);

  const handleRefresh = async () => {
    clearError();
    await refreshData();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <ProfessionalLoginForm />;
  }

  // Show authenticated dashboard
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <MinimalistHeader 
        user={user}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        loading={loading}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-300 mb-1">Connection Error</h3>
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CleanTrainingCard training={training} />
          <CleanStatsCard currentStats={currentStats} />
        </div>

        {/* Footer Status */}
        <div className="bg-slate-800 border border-slate-700 rounded p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-slate-400">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span>{error ? 'Connection Error' : 'Connected'}</span>
              </div>
              {lastUpdated && (
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-3 h-3 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-1"
                />
                <span className="ml-2">Auto-refresh</span>
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;