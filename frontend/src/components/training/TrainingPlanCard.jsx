/**
 * Training Plan Card Component (Updated)
 * Shows current training plan progress, details, and buyer information
 * 
 * @file src/components/training/TrainingPlanCard.jsx
 * @author Training Company App
 * @version 2.0.0 (Added trains buyer info and rate per train)
 */

import React from 'react';
import StatusBadge from '../common/StatusBadge';

/**
 * Training Plan Card Component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.trainingData - Training data with progress
 * @param {Object} props.company - Company data (for buyer info and rate)
 * @param {string} props.title - Card title
 * @param {boolean} props.showProgress - Whether to show progress bar
 * @returns {JSX.Element} Training plan card component
 */
const TrainingPlanCard = ({ 
  darkMode = false, 
  trainingData, 
  company,
  title = "Training Plan",
  showProgress = true
}) => {
  // Calculate progress percentage
  const totalPurchased = trainingData.totalTrainsPurchased || 900;
  const trainsReceived = trainingData.trainsReceived || 0;
  const trainsRemaining = trainingData.trainsRemaining || totalPurchased;
  const progressPercentage = totalPurchased > 0 ? ((trainsReceived / totalPurchased) * 100).toFixed(1) : 0;

  // Determine status based on remaining trains
  const getStatus = () => {
    if (trainsRemaining <= 0) return 'completed';
    if (trainsRemaining < 50) return 'critical';
    if (trainsRemaining < 150) return 'low';
    return 'good';
  };

  const status = getStatus();

  return (
    <div className={`rounded-xl shadow-lg border p-6 ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h2>
        <StatusBadge 
          status={status}
          size="md"
          darkMode={darkMode}
        />
      </div>

      <div className="space-y-4">
        {/* Trains Buyer Information */}
        {company?.trainsBuyer && (
          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className={`font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Trains Buyer: {company.trainsBuyer.name}
                </span>
                <div className={`text-sm mt-1 ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Rate: ${company.rate ? company.rate.toLocaleString() : 'N/A'} per train
                </div>
              </div>
            </div>
            {company.trainsBuyer.notes && (
              <div className={`text-sm ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                {company.trainsBuyer.notes}
              </div>
            )}
          </div>
        )}

        {/* Training Plan Details */}
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-slate-700/50' : 'bg-blue-50'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`font-medium ${
              darkMode ? 'text-white' : 'text-blue-900'
            }`}>
              Plan: {totalPurchased.toLocaleString()} trains as {trainingData.currentStat}
            </span>
          </div>
          <div className={`text-sm ${
            darkMode ? 'text-slate-300' : 'text-blue-700'
          }`}>
            Target: {trainingData.targetLevel ? trainingData.targetLevel.toLocaleString() : 'Not specified'}
          </div>
          {trainingData.currentLevel && (
            <div className={`text-sm ${
              darkMode ? 'text-slate-300' : 'text-blue-700'
            }`}>
              Current Level: {trainingData.currentLevel.toLocaleString()}
            </div>
          )}
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
          }`}>
            <div className={`text-2xl font-bold ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              {trainsReceived.toLocaleString()}
            </div>
            <div className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Trains Completed
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
          }`}>
            <div className={`text-2xl font-bold ${
              trainsRemaining > 0 
                ? darkMode ? 'text-orange-400' : 'text-orange-600'
                : darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              {trainsRemaining.toLocaleString()}
            </div>
            <div className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Trains Remaining
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Progress
              </span>
              <span className={`text-sm ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                {progressPercentage}%
              </span>
            </div>
            <div className={`w-full h-3 rounded-full ${
              darkMode ? 'bg-slate-700' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Time Estimates */}
        {trainingData.daysRemaining !== undefined && trainingData.averageTrainsPerDay && (
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Estimated Completion:
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ~{trainingData.daysRemaining} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Current Pace:
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {trainingData.averageTrainsPerDay} trains/day
              </span>
            </div>
          </div>
        )}

        {/* Revenue Information */}
        {company?.rate && trainsReceived > 0 && (
          <div className={`p-3 rounded-lg border-l-4 ${
            darkMode ? 'bg-slate-700/30 border-green-400' : 'bg-green-50 border-green-400'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${
                darkMode ? 'text-slate-400' : 'text-green-700'
              }`}>
                Revenue Generated:
              </span>
              <span className={`font-bold ${
                darkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                ${(trainsReceived * company.rate).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        {trainingData.notes && trainingData.notes !== 'No training assignment' && (
          <div className={`p-3 rounded-lg border-l-4 ${
            darkMode ? 'bg-slate-700/30 border-blue-400' : 'bg-blue-50 border-blue-400'
          }`}>
            <div className={`text-sm ${
              darkMode ? 'text-slate-300' : 'text-blue-700'
            }`}>
              <strong>Notes:</strong> {trainingData.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPlanCard;