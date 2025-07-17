/**
 * StatsCard Component - Individual statistics display card
 * Shows a single metric with icon, value, and label
 * 
 * @file src/components/stats/StatsCard.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';

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
 * Get icon configuration based on stat type
 * @param {string} iconType - Type of icon to display
 * @returns {Object} Icon configuration
 */
const getIconConfig = (iconType) => {
  const icons = {
    companies: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      bgColorDark: 'bg-blue-900/50',
      iconColor: 'text-blue-600',
      iconColorDark: 'text-blue-400'
    },
    employees: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      bgColorDark: 'bg-green-900/50',
      iconColor: 'text-green-600',
      iconColorDark: 'text-green-400'
    },
    trains: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      bgColorDark: 'bg-purple-900/50',
      iconColor: 'text-purple-600',
      iconColorDark: 'text-purple-400'
    },
    critical: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: 'bg-red-100',
      bgColorDark: 'bg-red-900/50',
      iconColor: 'text-red-600',
      iconColorDark: 'text-red-400'
    },
    revenue: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      bgColor: 'bg-yellow-100',
      bgColorDark: 'bg-yellow-900/50',
      iconColor: 'text-yellow-600',
      iconColorDark: 'text-yellow-400'
    },
    users: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgColor: 'bg-indigo-100',
      bgColorDark: 'bg-indigo-900/50',
      iconColor: 'text-indigo-600',
      iconColorDark: 'text-indigo-400'
    }
  };

  return icons[iconType] || icons.companies;
};

/**
 * StatsCard Component - Individual statistics display card
 * @param {Object} props - Component props
 * @param {string|number} props.value - The main statistic value
 * @param {string} props.label - The label describing the statistic
 * @param {string} props.iconType - Type of icon to display
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onClick - Click handler for the card
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.trend - Trend direction ('up', 'down', or 'neutral')
 * @param {string} props.trendValue - Trend value to display
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} StatsCard component
 */
const StatsCard = ({ 
  value, 
  label, 
  iconType = 'companies',
  darkMode = false,
  onClick,
  isLoading = false,
  trend,
  trendValue,
  className = ''
}) => {
  const iconConfig = getIconConfig(iconType);
  
  const cardClasses = `${
    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
  } rounded-xl shadow-md p-6 border transition-all duration-200 ${
    onClick ? 'cursor-pointer hover:shadow-lg' : ''
  } ${className}`;

  const handleClick = () => {
    if (onClick) onClick();
  };

  /**
   * Get trend configuration for styling
   * @param {string} trend - Trend direction
   * @returns {Object} Trend configuration
   */
  const getTrendConfig = (trend) => {
    const configs = {
      up: {
        color: darkMode ? 'text-green-400' : 'text-green-600',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        )
      },
      down: {
        color: darkMode ? 'text-red-400' : 'text-red-600',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7L7.8 16.2M7 7v10h10" />
          </svg>
        )
      },
      neutral: {
        color: darkMode ? 'text-slate-400' : 'text-gray-500',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        )
      }
    };
    
    return configs[trend] || configs.neutral;
  };

  const trendConfig = trend ? getTrendConfig(trend) : null;

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Main Value */}
          <div className={`text-2xl font-bold mb-1 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              formatNumber(value)
            )}
          </div>
          
          {/* Label */}
          <div className={`text-sm ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {label}
          </div>
          
          {/* Trend */}
          {trendConfig && trendValue && (
            <div className={`flex items-center mt-2 text-xs ${trendConfig.color}`}>
              {trendConfig.icon}
              <span className="ml-1">{trendValue}</span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div className={`w-12 h-12 ${
          darkMode ? iconConfig.bgColorDark : iconConfig.bgColor
        } rounded-lg flex items-center justify-center`}>
          <div className={
            darkMode ? iconConfig.iconColorDark : iconConfig.iconColor
          }>
            {iconConfig.icon}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * StatsGrid Component - Grid container for multiple StatsCard components
 * @param {Object} props - Component props
 * @param {Array} props.stats - Array of stat objects
 * @param {boolean} props.darkMode - Dark mode state
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} StatsGrid component
 */
export const StatsGrid = ({ stats, darkMode = false, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <StatsCard
          key={stat.id || index}
          value={stat.value}
          label={stat.label}
          iconType={stat.iconType}
          darkMode={darkMode}
          onClick={stat.onClick}
          isLoading={stat.isLoading}
          trend={stat.trend}
          trendValue={stat.trendValue}
        />
      ))}
    </div>
  );
};

export default StatsCard;