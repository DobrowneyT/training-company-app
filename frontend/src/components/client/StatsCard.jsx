/**
 * Stats Card Component - Displays current work stats from Torn City API
 * Shows Manual Labor, Intelligence, and Endurance with visual indicators
 * 
 * @file src/components/client/StatsCard.jsx
 * @author Training Company App
 * @version 2.0.0
 */

import React from 'react';

/**
 * Get stat configuration including icons and colors
 * @param {string} statType - Type of stat (manual_labor, intelligence, endurance)
 * @returns {Object} Stat configuration object
 */
const getStatConfig = (statType) => {
  const configs = {
    manual_labor: {
      name: 'Manual Labor',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      bgClass: 'bg-orange-50',
      iconClass: 'text-orange-500',
      textClass: 'text-orange-700',
      borderClass: 'border-orange-200'
    },
    intelligence: {
      name: 'Intelligence',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-500',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-200'
    },
    endurance: {
      name: 'Endurance',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgClass: 'bg-green-50',
      iconClass: 'text-green-500',
      textClass: 'text-green-700',
      borderClass: 'border-green-200'
    }
  };

  return configs[statType] || {
    name: 'Unknown',
    icon: null,
    bgClass: 'bg-gray-50',
    iconClass: 'text-gray-500',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-200'
  };
};

/**
 * Format large numbers with appropriate suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return 'N/A';
  }

  const number = parseInt(num);
  
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + 'B';
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  } else {
    return number.toLocaleString();
  }
};

/**
 * Individual stat item component
 * @param {Object} props - Component props
 * @param {string} props.statType - Type of stat
 * @param {number} props.value - Stat value
 * @param {boolean} props.isCurrentStat - Whether this is the currently training stat
 */
const StatItem = ({ statType, value, isCurrentStat }) => {
  const config = getStatConfig(statType);
  
  return (
    <div className={`
      relative rounded-lg border-2 p-4 transition-all duration-200
      ${isCurrentStat 
        ? `${config.bgClass} ${config.borderClass} shadow-md` 
        : 'bg-white border-gray-200 hover:border-gray-300'
      }
    `}>
      {/* Current Training Indicator */}
      {isCurrentStat && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Training
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${config.bgClass} ${config.iconClass}`}>
            {config.icon}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              {config.name}
            </h3>
            <p className="text-xs text-gray-600">
              Current Level
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${isCurrentStat ? config.textClass : 'text-gray-900'}`}>
            {formatNumber(value)}
          </div>
          <div className="text-xs text-gray-500">
            {value !== null && value !== undefined && !isNaN(value) 
              ? parseInt(value).toLocaleString() 
              : 'Loading...'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Stats Card Component
 * @param {Object} props - Component props
 * @param {Object} props.currentStats - Current work stats object
 * @param {number} props.currentStats.manual_labor - Manual Labor stat
 * @param {number} props.currentStats.intelligence - Intelligence stat
 * @param {number} props.currentStats.endurance - Endurance stat
 * @param {Object} props.training - Training data for highlighting current stat
 * @param {string} props.training.currentStat - Currently training stat
 * @param {Date} props.lastUpdated - Last update timestamp
 * @param {string} props.className - Additional CSS classes
 */
const StatsCard = ({ currentStats, training, lastUpdated, className = '' }) => {
  /**
   * Get currently training stat type
   * @returns {string|null} Stat type being trained or null
   */
  const getCurrentTrainingStat = () => {
    if (!training || !training.currentStat) return null;
    
    const statMap = {
      'Manual Labor': 'manual_labor',
      'Intelligence': 'intelligence',
      'Endurance': 'endurance'
    };
    
    return statMap[training.currentStat] || null;
  };

  const currentTrainingStat = getCurrentTrainingStat();
  
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Card Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Current Work Stats
              </h2>
              <p className="text-sm text-gray-600">
                Live data from Torn City
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {currentStats ? (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="space-y-3">
              <StatItem
                statType="manual_labor"
                value={currentStats.manual_labor}
                isCurrentStat={currentTrainingStat === 'manual_labor'}
              />
              <StatItem
                statType="intelligence"
                value={currentStats.intelligence}
                isCurrentStat={currentTrainingStat === 'intelligence'}
              />
              <StatItem
                statType="endurance"
                value={currentStats.endurance}
                isCurrentStat={currentTrainingStat === 'endurance'}
              />
            </div>

            {/* Training Indicator */}
            {currentTrainingStat && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">
                    Currently training: {getStatConfig(currentTrainingStat).name}
                  </p>
                </div>
              </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Total</div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentStats && 
                    formatNumber(
                      (currentStats.manual_labor || 0) + 
                      (currentStats.intelligence || 0) + 
                      (currentStats.endurance || 0)
                    )
                  }
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Highest</div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentStats && 
                    formatNumber(
                      Math.max(
                        currentStats.manual_labor || 0,
                        currentStats.intelligence || 0,
                        currentStats.endurance || 0
                      )
                    )
                  }
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Lowest</div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentStats && 
                    formatNumber(
                      Math.min(
                        currentStats.manual_labor || 0,
                        currentStats.intelligence || 0,
                        currentStats.endurance || 0
                      )
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Loading State */
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
            </div>
            <p className="text-gray-500">Loading work stats...</p>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Work Statistics</span>
          <span>
            Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;