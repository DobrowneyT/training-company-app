/**
 * CompanyModal Component - Displays detailed company information in a modal
 * Shows company details, training metrics, and action buttons
 * 
 * @file src/components/company/CompanyModal.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import StatusBadge, { BooleanStatusBadge } from '../common/StatusBadge';

/**
 * Get status configuration for styling
 * @param {string} status - Status level (good, low, critical)
 * @returns {Object} Status configuration object
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
 * @returns {string} Formatted number string
 */
const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString();
};

/**
 * Format currency values with K/M suffixes
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  } else {
    return `${amount.toLocaleString()}`;
  }
};

/**
 * Company Icon Component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @returns {JSX.Element} Company icon
 */
const CompanyIcon = ({ darkMode }) => (
  <div className={`w-12 h-12 ${
    darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
  } rounded-lg flex items-center justify-center`}>
    <svg className={`w-6 h-6 ${
      darkMode ? 'text-blue-400' : 'text-blue-600'
    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
      />
    </svg>
  </div>
);

/**
 * Close Icon Component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @returns {JSX.Element} Close icon
 */
const CloseIcon = ({ darkMode }) => (
  <svg className={`w-5 h-5 ${
    darkMode ? 'text-slate-400' : 'text-gray-500'
  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Modal Header Component
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onClose - Close handler
 * @returns {JSX.Element} Modal header
 */
const ModalHeader = ({ company, darkMode, onClose }) => (
  <div className={`flex items-center justify-between p-6 border-b ${
    darkMode ? 'border-slate-700' : 'border-gray-100'
  }`}>
    <div className="flex items-center space-x-4">
      <CompanyIcon darkMode={darkMode} />
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
      <CloseIcon darkMode={darkMode} />
    </button>
  </div>
);

/**
 * Status Banner Component
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.statusConfig - Status configuration
 * @returns {JSX.Element} Status banner
 */
const StatusBanner = ({ company, darkMode, statusConfig }) => (
  <div className={`p-4 rounded-lg mb-6 border ${statusConfig.color}`}>
    <div className="flex items-center space-x-3">
      <StatusBadge 
        status={company.status}
        size="lg"
        darkMode={darkMode}
      />
      <div>
        <h3 className="font-semibold">Status: {statusConfig.label}</h3>
        <p className="text-sm opacity-80">
          {company.trainsRemaining} trains remaining • {company.daysRemaining} days
        </p>
      </div>
    </div>
  </div>
);

/**
 * Company Details Section
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {boolean} props.darkMode - Dark mode state
 * @returns {JSX.Element} Company details section
 */
const CompanyDetails = ({ company, darkMode }) => (
  <div className="space-y-4">
    <h4 className={`font-semibold ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}>Company Details</h4>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Director:</span>
        <span className={`font-medium ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>{company.director.name} [{company.director.tornId}]</span>
      </div>
      <div className="flex justify-between">
        <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Trains Buyer:</span>
        <span className={`font-medium ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>{company.trainsBuyer.name} [{company.trainsBuyer.tornId}]</span>
      </div>
      <div className="flex justify-between">
        <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Rate:</span>
        <span className={`font-medium ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>{formatCurrency(company.rate)} per train</span>
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
          <BooleanStatusBadge 
            isEnabled={company.hasTCP}
            enabledLabel="TCP"
            disabledLabel="No TCP"
            size="sm"
            darkMode={darkMode}
          />
          <BooleanStatusBadge 
            isEnabled={company.hasTGP}
            enabledLabel="TGP"
            disabledLabel="No TGP"
            size="sm"
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Training Metrics Section
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.statusConfig - Status configuration
 * @returns {JSX.Element} Training metrics section
 */
const TrainingMetrics = ({ company, darkMode, statusConfig }) => (
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
);

/**
 * Advertising Section
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {boolean} props.darkMode - Dark mode state
 * @returns {JSX.Element} Advertising section
 */
const AdvertisingSection = ({ company, darkMode }) => {
  if (!company.advertising) return null;
  
  return (
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
  );
};

/**
 * Action Buttons Section
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onAddTrains - Add trains handler
 * @param {Function} props.onViewQueue - View queue handler
 * @returns {JSX.Element} Action buttons section
 */
const ActionButtons = ({ company, darkMode, onAddTrains, onViewQueue }) => (
  <div className="flex flex-wrap gap-3">
    <button 
      onClick={onAddTrains}
      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
    >
      Add Trains
    </button>
    <button 
      onClick={onViewQueue}
      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
    >
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
);

/**
 * CompanyModal Component - Modal for displaying detailed company information
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data object
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler function
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onAddTrains - Add trains handler
 * @param {Function} props.onViewQueue - View queue handler
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} CompanyModal component
 */
const CompanyModal = ({ 
  company, 
  isOpen, 
  onClose, 
  darkMode = false,
  onAddTrains,
  onViewQueue,
  className = ''
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !company) return null;
  
  const statusConfig = getStatusConfig(company.status);
  
  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${
        darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'
      } rounded-t-2xl w-full max-w-2xl mx-4 mb-0 shadow-2xl transform transition-all duration-300 border-t border-l border-r`}>
        
        {/* Header */}
        <ModalHeader 
          company={company}
          darkMode={darkMode}
          onClose={onClose}
        />
        
        {/* Content */}
        <div className="p-6">
          {/* Status Banner */}
          <StatusBanner 
            company={company}
            darkMode={darkMode}
            statusConfig={statusConfig}
          />
          
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CompanyDetails company={company} darkMode={darkMode} />
            <TrainingMetrics 
              company={company}
              darkMode={darkMode}
              statusConfig={statusConfig}
            />
          </div>
          
          {/* Advertising */}
          <AdvertisingSection company={company} darkMode={darkMode} />
          
          {/* Action Buttons */}
          <ActionButtons 
            company={company}
            darkMode={darkMode}
            onAddTrains={onAddTrains}
            onViewQueue={onViewQueue}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;