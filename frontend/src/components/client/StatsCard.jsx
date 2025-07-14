/**
 * Current Stats Card Component
 * 
 * Displays user's current work statistics from Torn City including
 * Manual Labor, Intelligence, and Endurance with formatting and trends.
 * 
 * @component
 * @example
 * <StatsCard />
 */

import React from 'react';
import { useClient } from '../../context/ClientContext';

/**
 * Current work stats card component
 * 
 * Shows user's current work statistics with proper formatting,
 * visual indicators, and refresh functionality.
 * 
 * @returns {JSX.Element} Current stats card
 */
const StatsCard = () => {
  const { currentStats, training, lastUpdated, loading } = useClient();

  /**
   * Get stat information including emoji and color
   * 
   * @param {string} statName - Name of the stat
   * @returns {Object} Stat display information
   */
  const getStatInfo = (statName) => {
    const statMap = {
      'manual_labor': {
        emoji: '💪',
        label: 'Manual Labor',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      'intelligence': {
        emoji: '🧠',
        label: 'Intelligence',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'endurance': {
        emoji: '🏃',
        label: 'Endurance',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    };

    return statMap[statName] || {
      emoji: '❓',
      label: statName,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  /**
   * Format number with commas for better readability
   * 
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  /**
   * Check if current stat is being trained
   * 
   * @param {string} statName - Name of the stat to check
   * @returns {boolean} True if stat is currently being trained
   */
  const isCurrentTrainingStat = (statName) => {
    if (!training || !training.currentStat) return false;
    
    const statMap = {
      'manual_labor': 'Manual Labor',
      'intelligence': 'Intelligence',
      'endurance': 'Endurance'
    };
    
    return statMap[statName] === training.currentStat;
  };

  /**
   * Get progress towards target level
   * 
   * @param {string} statName - Name of the stat
   * @returns {Object|null} Progress information or null
   */
  const getTargetProgress = (statName) => {
    if (!isCurrentTrainingStat(statName) || !training.targetLevel || !currentStats) {
      return null;
    }
    
    const currentValue = currentStats[statName];
    const targetValue = training.targetLevel;
    
    if (currentValue >= targetValue) {
      return { 
        percentage: 100, 
        remaining: 0,
        achieved: true
      };
    }
    
    const progress = (currentValue / targetValue) * 100;
    const remaining = targetValue - currentValue;
    
    return {
      percentage: Math.min(progress, 100),
      remaining: remaining,
      achieved: false
    };
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Work Stats...
            </h2>
            <p className="text-gray-600">
              Fetching your current statistics from Torn City
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentStats) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Stats Unavailable
            </h2>
            <p className="text-gray-600">
              Unable to fetch work statistics. Please try refreshing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Current Work Stats
        </h2>
      </div>
      
      <div className="card-body">
        <div className="space-y-4">
          {/* Manual Labor */}
          <div className="stat-row">
            {(() => {
              const statInfo = getStatInfo('manual_labor');
              const isTraining = isCurrentTrainingStat('manual_labor');
              const progress = getTargetProgress('manual_labor');
              
              return (
                <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  isTraining 
                    ? `${statInfo.bgColor} ${statInfo.borderColor} border-dashed` 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{statInfo.emoji}</span>
                      <span className={`font-medium ${isTraining ? statInfo.color : 'text-gray-700'}`}>
                        {statInfo.label}
                      </span>
                      {isTraining && (
                        <span className="ml-2 badge badge-info">
                          Training
                        </span>
                      )}
                    </div>
                    <span className={`text-xl font-bold ${isTraining ? statInfo.color : 'text-gray-900'}`}>
                      {formatNumber(currentStats.manual_labor)}
                    </span>
                  </div>
                  
                  {progress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Target: {formatNumber(training.targetLevel)}</span>
                        <span className={statInfo.color}>
                          {progress.achieved ? 'Target Achieved!' : `${formatNumber(progress.remaining)} to go`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            progress.achieved ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Intelligence */}
          <div className="stat-row">
            {(() => {
              const statInfo = getStatInfo('intelligence');
              const isTraining = isCurrentTrainingStat('intelligence');
              const progress = getTargetProgress('intelligence');
              
              return (
                <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  isTraining 
                    ? `${statInfo.bgColor} ${statInfo.borderColor} border-dashed` 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{statInfo.emoji}</span>
                      <span className={`font-medium ${isTraining ? statInfo.color : 'text-gray-700'}`}>
                        {statInfo.label}
                      </span>
                      {isTraining && (
                        <span className="ml-2 badge badge-info">
                          Training
                        </span>
                      )}
                    </div>
                    <span className={`text-xl font-bold ${isTraining ? statInfo.color : 'text-gray-900'}`}>
                      {formatNumber(currentStats.intelligence)}
                    </span>
                  </div>
                  
                  {progress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Target: {formatNumber(training.targetLevel)}</span>
                        <span className={statInfo.color}>
                          {progress.achieved ? 'Target Achieved!' : `${formatNumber(progress.remaining)} to go`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            progress.achieved ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Endurance */}
          <div className="stat-row">
            {(() => {
              const statInfo = getStatInfo('endurance');
              const isTraining = isCurrentTrainingStat('endurance');
              const progress = getTargetProgress('endurance');
              
              return (
                <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  isTraining 
                    ? `${statInfo.bgColor} ${statInfo.borderColor} border-dashed` 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{statInfo.emoji}</span>
                      <span className={`font-medium ${isTraining ? statInfo.color : 'text-gray-700'}`}>
                        {statInfo.label}
                      </span>
                      {isTraining && (
                        <span className="ml-2 badge badge-info">
                          Training
                        </span>
                      )}
                    </div>
                    <span className={`text-xl font-bold ${isTraining ? statInfo.color : 'text-gray-900'}`}>
                      {formatNumber(currentStats.endurance)}
                    </span>
                  </div>
                  
                  {progress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Target: {formatNumber(training.targetLevel)}</span>
                        <span className={statInfo.color}>
                          {progress.achieved ? 'Target Achieved!' : `${formatNumber(progress.remaining)} to go`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            progress.achieved ? 'bg-green-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Last updated timestamp */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Last Updated:</span>
            <span>
              {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;