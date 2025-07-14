/**
 * Client Dashboard Page
 * 
 * Main dashboard page for training company clients. Shows API key verification
 * form for unauthenticated users and comprehensive training dashboard for
 * authenticated users.
 * 
 * @component
 * @example
 * <ClientDashboard />
 */

import React from 'react';
import { useClient } from '../context/ClientContext';
import Header from '../components/layout/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import APIKeyForm from '../components/client/APIKeyForm';
import TrainingCard from '../components/client/TrainingCard';
import StatsCard from '../components/client/StatsCard';

/**
 * Client dashboard page component
 * 
 * Renders different views based on authentication status:
 * - API key form for unauthenticated users
 * - Complete dashboard for authenticated users
 * 
 * @returns {JSX.Element} Client dashboard page
 */
const ClientDashboard = () => {
  const { 
    user, 
    loading, 
    error, 
    refreshData, 
    logout, 
    clearError,
    isAuthenticated,
    lastUpdated 
  } = useClient();

  /**
   * Handle refresh button click
   */
  const handleRefresh = async () => {
    console.log('🔄 Refreshing dashboard data...');
    await refreshData();
  };

  /**
   * Handle logout button click
   */
  const handleLogout = () => {
    console.log('👋 Logging out user...');
    logout();
  };

  /**
   * Handle error dismissal
   */
  const handleDismissError = () => {
    clearError();
  };

  // Show API key form if not authenticated
  if (!isAuthenticated) {
    return <APIKeyForm />;
  }

  // Show loading state for initial load
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title={`Welcome back, ${user?.name || 'User'}!`}
        subtitle="Training Company Dashboard"
        sticky={true}
      >
        <div className="flex items-center space-x-3">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-secondary"
            title="Refresh data"
          >
            <span className={`inline-block ${loading ? 'animate-spin' : ''}`}>
              🔄
            </span>
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="btn btn-secondary text-red-600 hover:text-red-700"
            title="Logout"
          >
            <span>👋</span>
            <span className="ml-2 hidden sm:inline">Logout</span>
          </button>
        </div>
      </Header>

      {/* Main content */}
      <main className="container py-8">
        {/* Error alert */}
        {error && (
          <div className="mb-6 alert alert-danger animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg mr-2">❌</span>
                <span>{error}</span>
              </div>
              <button
                onClick={handleDismissError}
                className="text-danger-600 hover:text-danger-700 font-bold text-lg"
                title="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Training assignment card */}
          <div className="animate-fade-in">
            <TrainingCard />
          </div>

          {/* Current stats card */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <StatsCard />
          </div>
        </div>

        {/* Additional info section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick stats */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="card-body text-center">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Training Progress
              </h3>
              <p className="text-sm text-gray-600">
                {user?.name || 'User'} is actively training and making progress
              </p>
            </div>
          </div>

          {/* Support info */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="card-body text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600">
                Contact your trainer for questions about assignments
              </p>
            </div>
          </div>

          {/* Last updated */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="card-body text-center">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Last Updated
              </h3>
              <p className="text-sm text-gray-600">
                {lastUpdated ? (
                  <>
                    {lastUpdated.toLocaleDateString()} at{' '}
                    {lastUpdated.toLocaleTimeString()}
                  </>
                ) : (
                  'Never'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Training Company Dashboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>User ID:</strong> {user?.tornId || 'N/A'}
              </div>
              <div>
                <strong>Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </div>
              <div>
                <strong>Data Source:</strong> Torn City API
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;