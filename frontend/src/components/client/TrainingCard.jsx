/**
 * Training Card Component - Displays current training assignment and progress
 * Shows stat type, sessions remaining, target level, and trainer notes
 * 
 * @file src/components/client/TrainingCard.jsx
 * @author Training Company App
 * @version 2.0.0
 */

import React from 'react';

/**
 * Get stat icon and styling based on training type
 * @param {string} stat - Training stat type
 * @returns {Object} Icon component and styling classes
 */
const getStatIcon = (stat) => {
  switch (stat) {
    case 'Manual Labor':
      return {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        ),
        color: 'orange',
        bgClass: 'bg-orange-50',
        textClass: 'text-orange-600',
        iconClass: 'text-orange-500'
      };
    case 'Intelligence':
      return {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ),
        color: 'blue',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-600',
        iconClass: 'text-blue-500'
      };
    case 'Endurance':
      return {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        color: 'green',
        bgClass: 'bg-green-50',
        textClass: 'text-green-600',
        iconClass: 'text-green-500'
      };
    default:
      return {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'gray',
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-600',
        iconClass: 'text-gray-500'
      };
  }
};

/**
 * Get progress color based on sessions remaining
 * @param {number} remaining - Sessions remaining
 * @param {number} total - Total sessions (estimated)
 * @returns {Object} Color classes for progress indication
 */
const getProgressColor = (remaining) => {
  if (remaining === 0) {
    return {
      bgClass: 'bg-red-100',
      textClass: 'text-red-700',
      borderClass: 'border-red-200'
    };
  } else if (remaining <= 5) {
    return {
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-700',
      borderClass: 'border-yellow-200'
    };
  } else {
    return {
      bgClass: 'bg-green-100',
      textClass: 'text-green-700',
      borderClass: 'border-green-200'
    };
  }
};

/**
 * Training Card Component
 * @param {Object} props - Component props
 * @param {Object} props.training - Training data object
 * @param {string} props.training.currentStat - Current training stat
 * @param {number} props.training.trainsRemaining - Sessions remaining
 * @param {number} props.training.targetLevel - Target level (optional)
 * @param {string} props.training.notes - Trainer notes (optional)
 * @param {string} props.training.updatedAt - Last update timestamp
 * @param {string} props.className - Additional CSS classes
 */
const TrainingCard = ({ training, className = '' }) => {
  // Handle missing training data
  if (!training) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">Loading training data...</p>
        </div>
      </div>
    );
  }

  const { currentStat, trainsRemaining, targetLevel, notes } = training;
  const statInfo = getStatIcon(currentStat);
  const progressInfo = getProgressColor(trainsRemaining);

  // Check if user has an assignment
  const hasAssignment = currentStat && currentStat !== 'Not Assigned';

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Card Header */}
      <div className={`${statInfo.bgClass} px-6 py-4 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${statInfo.bgClass} ${statInfo.iconClass}`}>
              {statInfo.icon}
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Current Assignment
              </h2>
              <p className="text-sm text-gray-600">
                Training Progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {hasAssignment ? (
          <div className="space-y-6">
            {/* Training Stat */}
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statInfo.bgClass} ${statInfo.textClass} mb-2`}>
                {currentStat}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {currentStat}
              </h3>
              <p className="text-gray-600">Currently Training</p>
            </div>

            {/* Sessions Remaining */}
            <div className="text-center">
              <div className={`inline-block px-4 py-2 rounded-lg border ${progressInfo.bgClass} ${progressInfo.textClass} ${progressInfo.borderClass}`}>
                <div className="text-3xl font-bold">
                  {trainsRemaining}
                </div>
                <div className="text-sm font-medium">
                  {trainsRemaining === 1 ? 'Session' : 'Sessions'} Remaining
                </div>
              </div>
            </div>

            {/* Training Details */}
            <div className="grid grid-cols-1 gap-4">
              {/* Target Level */}
              {targetLevel && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Target Level:
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {targetLevel.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span className={`text-sm font-medium ${
                    trainsRemaining === 0 
                      ? 'text-red-600' 
                      : trainsRemaining <= 5 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                  }`}>
                    {trainsRemaining === 0 
                      ? 'Training Complete' 
                      : trainsRemaining <= 5 
                        ? 'Nearly Complete' 
                        : 'In Progress'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Trainer Notes */}
            {notes && notes !== 'No training assignment' && notes !== 'New user - awaiting assignment' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Trainer Notes:
                </h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* No Assignment State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Assignment
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't been assigned training yet.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 text-sm">
                Contact your trainer for a training assignment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Training Assignment</span>
          <span>
            Updated: {training.updatedAt ? new Date(training.updatedAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrainingCard;