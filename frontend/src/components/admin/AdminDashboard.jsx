/**
 * Admin Dashboard Component - Main Company Overview
 * Displays companies table with expandable rows and statistics
 * 
 * @file src/components/admin/AdminDashboard.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import AdminHeader from './AdminHeader';
import CompanyTable from './CompanyTable';
import StatsOverview from './StatsOverview';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Admin Dashboard Component
 * @returns {JSX.Element} The admin dashboard
 */
const AdminDashboard = () => {
  const {
    admin,
    companies,
    analytics,
    loading,
    error,
    refreshData,
    clearError,
    lastUpdated
  } = useAdmin();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <AdminHeader 
        admin={admin}
        onRefresh={refreshData}
        loading={loading}
        lastUpdated={lastUpdated}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-300 mb-1">Error</h3>
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

        {/* Statistics Overview */}
        <StatsOverview analytics={analytics} loading={loading} />

        {/* Companies Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Training Companies</h2>
                <p className="text-sm text-slate-400">
                  {companies.length} {companies.length === 1 ? 'company' : 'companies'} registered
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded hover:border-slate-500 transition-colors disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button className="inline-flex items-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Company
                </button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {loading && companies.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" color="white" />
            </div>
          ) : (
            <CompanyTable companies={companies} loading={loading} />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;