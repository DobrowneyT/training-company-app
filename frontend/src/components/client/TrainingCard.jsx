/**
 * Training Status Card Component
 * 
 * Displays user's current training assignment including stat type,
 * sessions remaining, target level, and progress indicators.
 * 
 * @component
 * @example
 * <TrainingCard />
 */

import React from 'react';
import { useClient } from '../../context/ClientContext';

/**
 * Training status card component
 * 
 * Shows comprehensive training information including current stat,
 * remaining sessions, target level, and visual progress indicators.
 * 
 * @returns {JSX.Element} Training status card
 */
const TrainingCard = () => {
  const { training, getTrainingStatus, getStatInfo } = useClient();

  // Get training status and stat information
  const trainingStatus = getTrainingStatus();
  const statInfo = getStatInfo(training?.currentStat || 'Not Assigned');

  /**
   * Get progress percentage for visual indicator
   * 
   * @returns {number} Progress percentage (0-100)
   */
  const getProgressPercentage = () => {
    if (!training || !training.trainsRemaining) return 0;
    
    // Estimate progress based on common training amounts
    const commonAmounts = [5, 10, 20, 25, 50, 100];
    const remaining = training.trainsRemaining;
    
    // Find the likely total based on remaining sessions
    let estimatedTotal = remaining;
    for (const amount of commonAmounts) {
      if (remaining <= amount) {
        estimatedTotal = amount;
        break;
      }
    }
    
    const completed = estimatedTotal - remaining;
    return Math.max(0, Math.min(100, (completed / estimatedTotal) * 100));
  };

  /**
   * Get color classes based on training status
   * 
   * @returns {Object} Color classes for different elements
   */
  const getColorClasses = () => {
    const colorMap = {
      gray: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
        progress: 'bg-gray-500'
      },
      yellow: {
        bg: 'bg-warning-100',
        text: 'text-warning-800',
        border: 'border-warning-300',
        progress: 'bg-warning-500'
      },
      green: {
        bg: 'bg-success-100',
        text: 'text-success-800',
        border: 'border-success-300',
        progress: 'bg-success-500'
      },
      orange: {
        bg: 'bg-warning-100',
        text: 'text-warning-800',
        border: 'border-warning-300',
        progress: 'bg-warning-500'
      },
      blue: {
        bg: 'bg-primary-100',
        text: 'text-primary-800',
        border: 'border-primary-300',
        progress: 'bg-primary-500'
      },
      red: {
        bg: 'bg-danger-100',
        text: 'text-danger-800',
        border: 'border-danger-300',
        progress: 'bg-danger-500'
      }
    };

    return colorMap[trainingStatus.color] || colorMap.gray;
  };

  const colorClasses = getColorClasses();
  const progressPercentage = getProgressPercentage();

  if (!training) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Training Data...
            </h2>
            <p className="text-gray-600">
              Please wait while we fetch your training assignment
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
          <span className="text-2xl mr-2">{statInfo.emoji}</span>
          Current Training Assignment
        </h2>
      </div>
      
      <div className="card-body">
        {/* Training stat and status */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {training.currentStat}
          </div>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses.bg} ${colorClasses.text}`}>
            {trainingStatus.status}
          </div>
        </div>

        {/* Sessions remaining */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-primary-600 mb-2">
            {training.trainsRemaining}
          </div>
          <div className="text-lg text-gray-600">
            {training.trainsRemaining === 1 ? 'Session' : 'Sessions'} Remaining
          </div>
        </div>

        {/* Progress bar */}
        {training.trainsRemaining > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${colorClasses.progress}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Training details */}
        <div className="space-y-4">
          {/* Target level */}
          {training.targetLevel && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Target Level:</span>
              <span className="font-medium text-gray-900">
                {training.targetLevel.toLocaleString()}
              </span>
            </div>
          )}

          {/* Status message */}
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-gray-900">
              {trainingStatus.message}
            </span>
          </div>

          {/* Assignment date */}
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-medium text-gray-900">
              {new Date(training.updatedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Training notes */}
        {training.notes && training.notes !== 'No training assignment' && (
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="font-medium text-primary-900 mb-2">
              Trainer Notes:
            </h3>
            <p className="text-primary-800 text-sm">
              {training.notes}
            </p>
          </div>
        )}

        {/* No assignment message */}
        {training.currentStat === 'Not Assigned' && (
          <div className="mt-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⏳</span>
              <div>
                <h3 className="font-medium text-warning-900 mb-2">
                  Awaiting Training Assignment
                </h3>
                <p className="text-warning-800 text-sm">
                  You haven't been assigned a training stat yet. 
                  Please contact your trainer or wait for assignment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion message */}
        {training.trainsRemaining === 0 && training.currentStat !== 'Not Assigned' && (
          <div className="mt-6 bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🎉</span>
              <div>
                <h3 className="font-medium text-success-900 mb-2">
                  Training Complete!
                </h3>
                <p className="text-success-800 text-sm">
                  Congratulations! You've completed your {training.currentStat} training assignment.
                  Contact your trainer for payment or next assignment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingCard;