/**
 * Admin Header Component - Navigation and Status Bar
 * Displays admin info, refresh controls, and logout functionality
 * 
 * @file src/components/admin/AdminHeader.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';
import { useAdmin } from '../../context/AdminContext';

/**
 * Admin Header Component
 * @param {Object} props - Component props
 * @param {Object} props.admin - Admin user object
 * @param {Function} props.onRefresh - Refresh data function
 * @param {boolean} props.loading - Loading state
 * @param {Date} props.lastUpdated - Last update timestamp
 */
const AdminHeader = ({ admin, onRefresh, loading, lastUpdated }) => {
  const { logout } = useAdmin();

  /**
   * Handle logout with confirmation
   */
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Title and Admin Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Training Company Admin</h1>
                <p className="text-sm text-slate-400">Management Dashboard</p>
              </div>
            </div>
          </div>

          {/* Right Side - Controls and User Info */}
          <div className="flex items-center space-x-4">
            {/* Last Updated */}
            {lastUpdated && (
              <div className="hidden sm:block text-sm text-slate-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded hover:border-slate-500 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <svg 
                className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Admin Info and Logout */}
            <div className="flex items-center space-x-3">
              {/* Admin Avatar */}
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {admin?.username?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>

              {/* Admin Details */}
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-white">
                  {admin?.username || 'Admin'}
                </div>
                <div className="text-xs text-slate-400">
                  {admin?.role || 'Administrator'}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded hover:border-red-500 hover:text-red-300 transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Bar */}
      {loading && (
        <div className="h-0.5 bg-slate-700">
          <div className="h-full bg-blue-500 animate-pulse"></div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;