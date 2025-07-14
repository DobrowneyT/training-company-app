import React from 'react';

const Header = ({ title, subtitle, children, className = '', sticky = false }) => {
  const headerClasses = `bg-white shadow-sm border-b border-gray-200 ${sticky ? 'sticky top-0 z-40' : ''} ${className}`.trim();

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">{subtitle}</p>}
          </div>
          {children && <div className="flex items-center space-x-3 flex-shrink-0">{children}</div>}
        </div>
      </div>
    </header>
  );
};

export default Header;
