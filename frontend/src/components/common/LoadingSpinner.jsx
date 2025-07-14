/**
 * Loading Spinner Component - Displays animated loading indicator
 * Provides visual feedback during asynchronous operations
 * 
 * @file src/components/common/LoadingSpinner.jsx
 * @author Training Company App
 * @version 2.0.0
 */

import React from 'react';

/**
 * Loading Spinner Component
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner: 'sm', 'md', 'lg', 'xl'
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.color - Color variant: 'blue', 'white', 'gray'
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  color = 'blue' 
}) => {
  /**
   * Get size classes based on size prop
   * @param {string} size - Size variant
   * @returns {string} CSS classes for spinner size
   */
  const getSizeClasses = (size) => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    };
    return sizes[size] || sizes.md;
  };

  /**
   * Get color classes based on color prop
   * @param {string} color - Color variant
   * @returns {string} CSS classes for spinner color
   */
  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 border-t-blue-600',
      white: 'border-white/20 border-t-white',
      gray: 'border-gray-200 border-t-gray-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div 
        className={`
          ${getSizeClasses(size)} 
          ${getColorClasses(color)}
          border-4 rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;