import React from 'react';

const LoadingSpinner = ({ size = 'md', message, className = '', inline = false, color = 'primary' }) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClasses = color === 'white' ? 'border-white border-opacity-30 border-t-white' : 'border-gray-200 border-t-primary-600';
  const containerClasses = inline ? 'inline-flex items-center' : 'flex flex-col items-center justify-center';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`${sizeClass} ${colorClasses} border-4 rounded-full animate-spin`} role="status" aria-label={message || 'Loading'}>
        <span className="sr-only">{message || 'Loading...'}</span>
      </div>
      {message && !inline && <p className="mt-4 text-sm text-gray-600 text-center animate-pulse">{message}</p>}
      {message && inline && <span className="ml-2 text-sm text-gray-600">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
