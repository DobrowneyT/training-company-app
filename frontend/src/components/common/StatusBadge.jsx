/**
 * Status Badge Component
 * Displays status indicators with appropriate colors and icons
 * 
 * @file src/components/common/StatusBadge.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';

/**
 * Status configurations for different status types
 */
const statusConfigurations = {
  // Training/Company Status
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
  },
  
  // Request Status
  pending: {
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    icon: '⏳',
    label: 'Pending',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  approved: {
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    icon: '✅',
    label: 'Approved',
    textColor: 'text-green-600 dark:text-green-400'
  },
  rejected: {
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    icon: '❌',
    label: 'Rejected',
    textColor: 'text-red-600 dark:text-red-400'
  },
  completed: {
    color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    icon: '🎉',
    label: 'Completed',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  
  // General Status
  active: {
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    icon: '🟢',
    label: 'Active',
    textColor: 'text-green-600 dark:text-green-400'
  },
  inactive: {
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
    icon: '⚫',
    label: 'Inactive',
    textColor: 'text-gray-600 dark:text-gray-400'
  },
  
  // Boolean Status
  enabled: {
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    icon: '✓',
    label: 'Enabled',
    textColor: 'text-green-600 dark:text-green-400'
  },
  disabled: {
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
    icon: '✗',
    label: 'Disabled',
    textColor: 'text-gray-600 dark:text-gray-400'
  }
};

/**
 * Calculate status based on numerical values (for training/company status)
 * @param {number} trainsRemaining - Trains remaining
 * @param {number} daysRemaining - Days remaining
 * @returns {string} Status level
 */
export const calculateTrainingStatus = (trainsRemaining, daysRemaining) => {
  if (trainsRemaining < 0 || daysRemaining < 0) return 'critical';
  if (trainsRemaining < 50 || daysRemaining < 3) return 'low';
  return 'good';
};

/**
 * Status Badge Component
 * @param {Object} props - Component props
 * @param {string} props.status - Status type (good, low, critical, pending, etc.)
 * @param {string} props.size - Size variant (sm, md, lg)
 * @param {boolean} props.showIcon - Whether to show the icon
 * @param {boolean} props.showLabel - Whether to show the label text
 * @param {string} props.customLabel - Custom label text to override default
 * @param {string} props.customIcon - Custom icon to override default
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.darkMode - Dark mode state (for manual override)
 */
const StatusBadge = ({
  status = 'good',
  size = 'md',
  showIcon = true,
  showLabel = true,
  customLabel,
  customIcon,
  className = '',
  onClick,
  darkMode
}) => {
  const config = statusConfigurations[status] || statusConfigurations.good;
  
  /**
   * Get size classes based on size prop
   * @param {string} size - Size variant
   * @returns {string} CSS classes for size
   */
  const getSizeClasses = (size) => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizes[size] || sizes.md;
  };

  /**
   * Get icon size classes based on size prop
   * @param {string} size - Size variant
   * @returns {string} CSS classes for icon size
   */
  const getIconSizeClasses = (size) => {
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };
    return sizes[size] || sizes.md;
  };

  const baseClasses = `inline-flex items-center rounded-full font-medium border transition-colors ${getSizeClasses(size)}`;
  const colorClasses = config.color;
  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-sm' : '';

  return (
    <span
      className={`${baseClasses} ${colorClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    >
      {showIcon && (
        <span className={`${getIconSizeClasses(size)} ${showLabel ? 'mr-1' : ''}`}>
          {customIcon || config.icon}
        </span>
      )}
      {showLabel && (
        <span>
          {customLabel || config.label}
        </span>
      )}
    </span>
  );
};

/**
 * Specialized Company Status Badge
 * @param {Object} props - Component props
 * @param {number} props.trainsRemaining - Trains remaining
 * @param {number} props.daysRemaining - Days remaining
 * @param {Object} props.badgeProps - Additional props to pass to StatusBadge
 */
export const CompanyStatusBadge = ({ trainsRemaining, daysRemaining, ...badgeProps }) => {
  const status = calculateTrainingStatus(trainsRemaining, daysRemaining);
  return <StatusBadge status={status} {...badgeProps} />;
};

/**
 * Boolean Status Badge (for TCP/TGP, enabled/disabled states)
 * @param {Object} props - Component props
 * @param {boolean} props.isEnabled - Whether the feature is enabled
 * @param {string} props.enabledLabel - Label when enabled
 * @param {string} props.disabledLabel - Label when disabled
 * @param {Object} props.badgeProps - Additional props to pass to StatusBadge
 */
export const BooleanStatusBadge = ({ 
  isEnabled, 
  enabledLabel = 'Enabled', 
  disabledLabel = 'Disabled',
  ...badgeProps 
}) => {
  const status = isEnabled ? 'enabled' : 'disabled';
  const customLabel = isEnabled ? enabledLabel : disabledLabel;
  return <StatusBadge status={status} customLabel={customLabel} {...badgeProps} />;
};

/**
 * Request Status Badge
 * @param {Object} props - Component props
 * @param {string} props.requestStatus - Request status (pending, approved, rejected, completed)
 * @param {Object} props.badgeProps - Additional props to pass to StatusBadge
 */
export const RequestStatusBadge = ({ requestStatus, ...badgeProps }) => {
  return <StatusBadge status={requestStatus} {...badgeProps} />;
};

export default StatusBadge;