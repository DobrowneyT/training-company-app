/**
 * View Toggle Component
 * Button-style toggle for switching between grid and list views
 * 
 * @file src/components/common/ViewToggle.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';

/**
 * View Toggle Component
 * @param {Object} props - Component props
 * @param {string} props.viewMode - Current view mode ('grid' or 'list')
 * @param {Function} props.onToggle - Toggle handler function
 * @param {boolean} props.darkMode - Dark mode state
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether the toggle is disabled
 * @param {string} props.size - Size variant ('sm', 'md', 'lg')
 */
const ViewToggle = ({ 
  viewMode = 'grid', 
  onToggle, 
  darkMode = false, 
  className = '',
  disabled = false,
  size = 'md'
}) => {
  /**
   * Get size classes based on size prop
   * @param {string} size - Size variant
   * @returns {Object} Size classes for container and icons
   */
  const getSizeClasses = (size) => {
    const sizes = {
      sm: {
        container: 'p-0.5',
        button: 'w-8 h-6',
        icon: 'w-3 h-3'
      },
      md: {
        container: 'p-1',
        button: 'w-10 h-8',
        icon: 'w-4 h-4'
      },
      lg: {
        container: 'p-1.5',
        button: 'w-12 h-10',
        icon: 'w-5 h-5'
      }
    };
    return sizes[size] || sizes.md;
  };

  const sizeClasses = getSizeClasses(size);

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        flex items-center rounded-lg transition-colors cursor-pointer
        ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'}
        ${sizeClasses.container}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
      aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
    >
      {/* List View Icon */}
      <div
        className={`
          flex items-center justify-center rounded transition-colors
          ${sizeClasses.button}
          ${viewMode === 'list'
            ? 'bg-blue-600 text-white'
            : (darkMode ? 'text-slate-400' : 'text-gray-600')
          }
        `}
      >
        <svg 
          className={sizeClasses.icon} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 10h16M4 14h16M4 18h16" 
          />
        </svg>
      </div>
      
      {/* Grid View Icon */}
      <div
        className={`
          flex items-center justify-center rounded transition-colors
          ${sizeClasses.button}
          ${viewMode === 'grid'
            ? 'bg-blue-600 text-white'
            : (darkMode ? 'text-slate-400' : 'text-gray-600')
          }
        `}
      >
        <svg 
          className={sizeClasses.icon} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" 
          />
        </svg>
      </div>
    </button>
  );
};

export default ViewToggle;