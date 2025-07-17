/**
 * CompanyCard Component - Reusable company display card with grid/list views
 * Supports drag and drop functionality, status indicators, and click handlers
 * 
 * @file src/components/company/CompanyCard.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';
import StatusBadge from '../common/StatusBadge';

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
 * List View Component
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.statusConfig - Status configuration
 * @returns {JSX.Element} List view layout
 */
const ListView = ({ company, darkMode, statusConfig }) => (
  <div className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <CompanyIcon darkMode={darkMode} />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>{company.name}</h3>
            <div className={`text-sm font-medium ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Director: {company.director.name}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>{company.type}</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                Trains Buyer: <span className={`font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{company.trainsBuyer.name}</span>
              </div>
              <div className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                Rate: <span className={`font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{formatCurrency(company.rate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className={`text-2xl font-bold ${statusConfig.textColor}`}>
            {company.trainsRemaining > 0 ? '+' : ''}{formatNumber(company.trainsRemaining)}
          </div>
          <div className={`text-sm ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>trains remaining</div>
        </div>
        
        <StatusBadge 
          status={company.status}
          darkMode={darkMode}
        />
        
        <div className={darkMode ? 'text-slate-400' : 'text-gray-400'}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Grid View Component
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.statusConfig - Status configuration
 * @returns {JSX.Element} Grid view layout
 */
const GridView = ({ company, darkMode, statusConfig }) => (
  <div className="p-6">
    <div className="flex items-start justify-between mb-4">
      <CompanyIcon darkMode={darkMode} />
      <StatusBadge 
        status={company.status}
        size="sm"
        showLabel={false}
        darkMode={darkMode}
      />
    </div>
    
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className={`text-lg font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>{company.name}</h3>
        <div className={`text-sm font-medium ${
          darkMode ? 'text-slate-300' : 'text-gray-700'
        }`}>
          {company.director.name}
        </div>
      </div>
      <p className={`text-sm ${
        darkMode ? 'text-slate-400' : 'text-gray-600'
      }`}>{company.type}</p>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`text-sm ${
          darkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>Trains Buyer:</span>
        <span className={`text-sm font-medium ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>{company.trainsBuyer.name}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className={`text-sm ${
          darkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>Rate:</span>
        <span className={`text-sm font-medium ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>{formatCurrency(company.rate)}</span>
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
);

/**
 * CompanyCard Component - Displays company information in grid or list format
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data object
 * @param {string} props.viewMode - View mode ('grid' or 'list')
 * @param {Function} props.onClick - Click handler function
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onDragStart - Drag start handler
 * @param {Function} props.onDragOver - Drag over handler
 * @param {Function} props.onDragEnter - Drag enter handler
 * @param {Function} props.onDragLeave - Drag leave handler
 * @param {Function} props.onDrop - Drop handler
 * @param {Function} props.onDragEnd - Drag end handler
 * @param {boolean} props.isDragging - Whether this item is being dragged
 * @param {boolean} props.isDraggedOver - Whether this item is being dragged over
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} CompanyCard component
 */
const CompanyCard = ({ 
  company, 
  viewMode = 'grid',
  onClick, 
  darkMode = false,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDraggedOver = false,
  className = ''
}) => {
  const statusConfig = getStatusConfig(company.status);
  
  const cardClasses = `${
    darkMode 
      ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
      : 'bg-white border-gray-100 hover:border-gray-200'
  } rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border ${
    isDragging ? 'opacity-50 transform scale-95' : ''
  } ${
    isDraggedOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
  } ${className}`;
  
  const handleClick = () => {
    if (onClick) onClick(company);
  };

  const dragProps = {
    draggable: true,
    onDragStart: (e) => onDragStart && onDragStart(e, company),
    onDragOver: onDragOver,
    onDragEnter: (e) => onDragEnter && onDragEnter(e, company),
    onDragLeave: onDragLeave,
    onDrop: (e) => onDrop && onDrop(e, company),
    onDragEnd: onDragEnd
  };

  return (
    <div 
      className={viewMode === 'list' ? `${cardClasses} mb-4` : cardClasses}
      onClick={handleClick}
      {...dragProps}
    >
      {viewMode === 'list' ? (
        <ListView 
          company={company} 
          darkMode={darkMode} 
          statusConfig={statusConfig} 
        />
      ) : (
        <GridView 
          company={company} 
          darkMode={darkMode} 
          statusConfig={statusConfig} 
        />
      )}
    </div>
  );
};

export default CompanyCard;