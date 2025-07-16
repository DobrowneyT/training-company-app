/**
 * Modern Card-Based Admin Dashboard Component
 * Integrates with existing AdminContext and uses real company data
 * Features light/dark mode toggle and university-style card layout
 * 
 * @file src/components/admin/AdminDashboard.jsx
 * @author Training Company App
 * @version 3.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Mock data based on real companies (will be replaced with API data later)
 */
const mockRealCompanies = [
  {
    id: 'big-badda-boom',
    name: 'Big Badda Boom',
    type: 'Fireworks Stand',
    companyType: 12,
    owner: { name: 'Azrelix', tornId: 2750497 },
    trainsBuyer: { name: 'Manchineel', tornId: 944731 },
    hasTCP: true,
    hasTGP: true,
    education: 'All',
    advertising: '390k per train',
    totalTrainsPurchased: 700,
    trainsRemaining: -94,
    daysRemaining: -5.5,
    status: 'critical',
    sheetLink: 'https://docs.google.com/spreadsheets/d/1hFEa1_4kvkHEg3G-mfecPCETbqL8AhfMrQ7kN80qVyY',
    employeeCount: 47,
    isActive: true
  },
  {
    id: 'kn-fireworks',
    name: 'KN-fireworks',
    type: 'Fireworks Stand',
    companyType: 12,
    owner: { name: 'Styv-03', tornId: 2395198 },
    trainsBuyer: { name: 'Shyam09', tornId: 3703288 },
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
    trainsBuyer: { name: 'FAFOU', tornId: 3082159 },
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
    trainsBuyer: { name: 'Kelpgrizzley', tornId: 3189518 },
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
 * Calculate status based on trains remaining and days remaining
 * @param {number} trainsRemaining - Trains remaining
 * @param {number} daysRemaining - Days remaining
 * @returns {string} Status level
 */
const calculateStatus = (trainsRemaining, daysRemaining) => {
  if (trainsRemaining < 0 || daysRemaining < 0) return 'critical';
  if (trainsRemaining < 50 || daysRemaining < 3) return 'low';
  return 'good';
};

/**
 * Get status configuration for styling
 * @param {string} status - Status level
 * @returns {Object} Status configuration
 */
const getStatusConfig = (status) => {
  const configs = {
    good: {
      color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      icon: '✅',
      label: 'Good',
      textColor: 'text-green-600 dark:text-green-400'
    },
    low: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
      icon: '⚠️',
      label: 'Low',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    critical: {
      color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
      icon: '🚨',
      label: 'Critical',
      textColor: 'text-red-600 dark:text-red-400'
    }
  };
  return configs[status] || configs.good;
};

/**
 * Format numbers with appropriate signs and separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString();
};

/**
 * Individual Company Card Component
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {string} props.viewMode - View mode (grid or list)
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.darkMode - Dark mode state
 */
const CompanyCard = ({ company, viewMode, onClick, darkMode }) => {
  const statusConfig = getStatusConfig(company.status);
  
  if (viewMode === 'list') {
    return (
      <div 
        className={`${
          darkMode 
            ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
            : 'bg-white border-gray-100 hover:border-gray-200'
        } rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border mb-4`}
        onClick={() => onClick(company)}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Company Icon */}
              <div className={`w-12 h-12 ${
                darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
              } rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              
              {/* Company Info */}
              <div>
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{company.name}</h3>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>{company.type}</p>
              </div>
            </div>
            
            {/* Status and Metrics */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-2xl font-bold ${statusConfig.textColor}`}>
                  {company.trainsRemaining > 0 ? '+' : ''}{formatNumber(company.trainsRemaining)}
                </div>
                <div className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>trains remaining</div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                {statusConfig.icon} {statusConfig.label}
              </div>
              
              <div className={darkMode ? 'text-slate-400' : 'text-gray-400'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Grid view
  return (
    <div 
      className={`${
        darkMode 
          ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
          : 'bg-white border-gray-100 hover:border-gray-200'
      } rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border`}
      onClick={() => onClick(company)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 ${
            darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
          } rounded-lg flex items-center justify-center`}>
            <svg className={`w-6 h-6 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            {statusConfig.icon}
          </div>
        </div>
        
        {/* Company Info */}
        <div className="mb-4">
          <h3 className={`text-lg font-semibold mb-1 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>{company.name}</h3>
          <p className={`text-sm ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>{company.type}</p>
        </div>
        
        {/* Key Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>Owner:</span>
            <span className={`text-sm font-medium ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>{company.owner.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>Trains:</span>
            <span className={`text-sm font-bold ${statusConfig.textColor}`}>
              {company.trainsRemaining > 0 ? '+' : ''}{formatNumber(company.trainsRemaining)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>Days:</span>
            <span className={`text-sm font-medium ${statusConfig.textColor}`}>
              {company.daysRemaining > 0 ? '+' : ''}{company.daysRemaining}d
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Company Details Modal Component
 * @param {Object} props - Component props
 * @param {Object} props.company - Selected company
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.darkMode - Dark mode state
 */
const CompanyModal = ({ company, isOpen, onClose, darkMode }) => {
  if (!isOpen || !company) return null;
  
  const statusConfig = getStatusConfig(company.status);
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative ${
        darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'
      } rounded-t-2xl w-full max-w-2xl mx-4 mb-0 shadow-2xl transform transition-all duration-300 border-t border-l border-r`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          darkMode ? 'border-slate-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${
              darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
            } rounded-lg flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>{company.name}</h2>
              <p className={`text-sm ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>{company.type}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className={`p-2 ${
              darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
            } rounded-lg transition-colors`}
          >
            <svg className={`w-5 h-5 ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg mb-6 border ${statusConfig.color}`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{statusConfig.icon}</span>
              <div>
                <h3 className="font-semibold">Status: {statusConfig.label}</h3>
                <p className="text-sm opacity-80">
                  {company.trainsRemaining} trains remaining • {company.daysRemaining} days
                </p>
              </div>
            </div>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h4 className={`font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Company Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Owner:</span>
                  <span className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{company.owner.name} [{company.owner.tornId}]</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Trains Buyer:</span>
                  <span className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{company.trainsBuyer.name} [{company.trainsBuyer.tornId}]</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Employees:</span>
                  <span className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{company.employeeCount} active</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>TCP/TGP:</span>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      company.hasTCP 
                        ? (darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800')
                        : (darkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-800')
                    }`}>
                      {company.hasTCP ? 'TCP' : 'No TCP'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      company.hasTGP 
                        ? (darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800')
                        : (darkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-800')
                    }`}>
                      {company.hasTGP ? 'TGP' : 'No TGP'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className={`font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Training Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Trains Purchased:</span>
                  <span className={`font-bold text-lg ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatNumber(company.totalTrainsPurchased)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Trains Remaining:</span>
                  <span className={`font-bold text-lg ${statusConfig.textColor}`}>
                    {company.trainsRemaining > 0 ? '+' : ''}{formatNumber(company.trainsRemaining)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Days Remaining:</span>
                  <span className={`font-bold text-lg ${statusConfig.textColor}`}>
                    {company.daysRemaining > 0 ? '+' : ''}{company.daysRemaining}d
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Advertising */}
          {company.advertising && (
            <div className="mb-6">
              <h4 className={`font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Advertising</h4>
              <div className={`${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
              } p-4 rounded-lg border`}>
                <p className={darkMode ? 'text-slate-300' : 'text-gray-700'}>{company.advertising}</p>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Add Trains
            </button>
            <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
              View Queue
            </button>
            <button 
              onClick={() => window.open(company.sheetLink, '_blank')}
              className={`${
                darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } py-3 px-4 rounded-lg font-medium transition-colors`}
            >
              Open Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Admin Dashboard Component
 * @returns {JSX.Element} The admin dashboard
 */
const AdminDashboard = () => {
  // Context and state
  const {
    admin,
    companies: contextCompanies,
    analytics,
    loading,
    error,
    refreshData,
    clearError,
    lastUpdated
  } = useAdmin();

  // Local state for UI
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use mock data for now, will be replaced with contextCompanies later
  const companies = mockRealCompanies;

  // Calculate analytics from companies
  const calculatedAnalytics = {
    totalCompanies: companies.length,
    totalEmployees: companies.reduce((sum, company) => sum + (company.employeeCount || 0), 0),
    totalTrainsPurchased: companies.reduce((sum, company) => sum + (company.totalTrainsPurchased || 0), 0),
    pendingRequests: companies.filter(company => company.status === 'critical').length,
    ...analytics
  };

  /**
   * Handle company card click
   * @param {Object} company - Selected company
   */
  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  /**
   * Close modal
   */
  const closeModal = () => {
    setShowModal(false);
    setSelectedCompany(null);
  };

  /**
   * Toggle dark mode
   */
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode 
        ? 'bg-slate-950' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Header */}
      <header className={`${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      } shadow-sm border-b transition-colors duration-200 sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                { <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg> }
              </div>
              <div>
                <h1 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Training Admin</h1>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>Company Management</p>
              </div>
            </div>
            
            {/* Right: Controls and User */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
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

              {/* Refresh Button */}
              {lastUpdated && (
                <div className={`hidden sm:block text-xs ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              
              <button 
                onClick={refreshData}
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
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{admin?.username || 'MonChoon'}</div>
                  <div className={`text-xs ${
                    darkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>Administrator</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {admin?.username?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                </div>
              </div>
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
      
      {/* System Status Banner */}
      <div className={`${
        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-blue-50 border-blue-100'
      } border-b transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-blue-300' : 'text-blue-900'
                }`}>System Status</span>
                <span className={`text-sm ml-2 ${
                  darkMode ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  All systems operational • {calculatedAnalytics.pendingRequests} critical companies
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className={`mb-6 ${
            darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'
          } border rounded-lg p-4`}>
            <div className="flex items-start">
              <svg className={`w-5 h-5 mt-0.5 mr-3 ${
                darkMode ? 'text-red-400' : 'text-red-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className={`text-sm font-medium mb-1 ${
                  darkMode ? 'text-red-300' : 'text-red-800'
                }`}>Error</h3>
                <p className={`text-sm ${
                  darkMode ? 'text-red-400' : 'text-red-700'
                }`}>{error}</p>
                <button
                  onClick={clearError}
                  className={`mt-2 text-xs underline ${
                    darkMode ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-500'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Companies */}
          <div className={`${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          } rounded-xl shadow-md p-6 border transition-colors duration-200`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{calculatedAnalytics.totalCompanies}</div>
                <div className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>Companies</div>
              </div>
              <div className={`w-12 h-12 ${
                darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
              } rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Employees */}
          <div className={`${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          } rounded-xl shadow-md p-6 border transition-colors duration-200`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{formatNumber(calculatedAnalytics.totalEmployees)}</div>
                <div className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>Employees</div>
              </div>
              <div className={`w-12 h-12 ${
                darkMode ? 'bg-green-900/50' : 'bg-green-100'
              } rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Total Trains */}
          <div className={`${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          } rounded-xl shadow-md p-6 border transition-colors duration-200`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{formatNumber(calculatedAnalytics.totalTrainsPurchased)}</div>
                <div className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>Total Trains</div>
              </div>
              <div className={`w-12 h-12 ${
                darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
              } rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Critical Companies */}
          <div className={`${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          } rounded-xl shadow-md p-6 border transition-colors duration-200`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${
                  calculatedAnalytics.pendingRequests > 0 
                    ? (darkMode ? 'text-red-400' : 'text-red-600')
                    : (darkMode ? 'text-white' : 'text-gray-900')
                }`}>{calculatedAnalytics.pendingRequests}</div>
                <div className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>Critical</div>
              </div>
              <div className={`w-12 h-12 ${
                darkMode ? 'bg-red-900/50' : 'bg-red-100'
              } rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Companies Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Training Companies</h2>
            <p className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
              Manage your training companies and their status
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className={`flex ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            } border rounded-lg shadow-sm`}>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : (darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50')
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : (darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50')
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
              + Add Company
            </button>
          </div>
        </div>
        
        {/* Companies Grid/List */}
        {loading && companies.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" color={darkMode ? "white" : "blue"} />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <div className={`w-16 h-16 ${
              darkMode ? 'bg-slate-700' : 'bg-gray-100'
            } rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-8 h-8 ${
                darkMode ? 'text-slate-400' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>No Companies Found</h3>
            <p className={`mb-6 ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>No training companies have been registered yet.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Register First Company
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-0'}>
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                viewMode={viewMode}
                onClick={handleCompanyClick}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Company Details Modal */}
      <CompanyModal
        company={selectedCompany}
        isOpen={showModal}
        onClose={closeModal}
        darkMode={darkMode}
      />
    </div>
  );
};

export default AdminDashboard;