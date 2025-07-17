/**
 * Dashboard Header Component
 * Reusable header layout for all dashboard types (Admin, Company Owner, Trains Buyer)
 * 
 * @file src/components/layout/DashboardHeader.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';
import UserProfileButton from '../common/UserProfileButton';

/**
 * Dashboard Header Component
 * @param {Object} props - Component props
 * @param {string} props.title - Main title text
 * @param {string} props.subtitle - Subtitle text
 * @param {Object} props.user - User data object
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onToggleDarkMode - Dark mode toggle handler
 * @param {Function} props.onRefresh - Refresh data handler
 * @param {Function} props.onLogout - Logout handler
 * @param {boolean} props.loading - Loading state
 * @param {Date} props.lastUpdated - Last update timestamp
 * @param {React.ReactNode} props.children - Additional elements to render in header
 * @param {React.ReactNode} props.actionButtons - Action buttons to render
 * @param {string} props.className - Additional CSS classes
 */
const DashboardHeader = ({
  title = 'Dashboard',
  subtitle = 'Management System',
  user,
  darkMode = false,
  onToggleDarkMode,
  onRefresh,
  onLogout,
  loading = false,
  lastUpdated,
  children,
  actionButtons,
  className = ''
}) => {
  return (
    <header className={`${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
    } shadow-sm border-b transition-colors duration-200 sticky top-0 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h1>
              <p className={`text-sm ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {subtitle}
              </p>
            </div>
          </div>
          
          {/* Right: Controls and User */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {/* Last Updated Display */}
            {lastUpdated && (
              <div className={`hidden sm:block text-xs ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            
            {/* Refresh Button */}
            {onRefresh && (
              <button 
                onClick={onRefresh}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                  darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Refresh data"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}

            {/* Additional Action Buttons */}
            {actionButtons && (
              <div className="flex items-center space-x-2">
                {actionButtons}
              </div>
            )}

            {/* Additional Children */}
            {children}
            
            {/* User Profile */}
            {user && (
              <UserProfileButton 
                user={user}
                darkMode={darkMode}
                onLogout={onLogout}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Loading Bar */}
      {loading && (
        <div className={`h-0.5 ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
          <div className="h-full bg-blue-500 animate-pulse"></div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;