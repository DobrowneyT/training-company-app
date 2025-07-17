/**
 * Company Information Card Component (Updated)
 * Shows basic company details organized into two columns
 * 
 * @file src/components/company/CompanyInfoCard.jsx
 * @author Training Company App
 * @version 2.0.0 (Reorganized layout, moved training info to TrainingPlanCard)
 */

import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Calculate hours ago from a given date
 * @param {Date|string} date - The date to calculate from
 * @returns {string} Formatted string like "(2 hours ago)"
 */
const getHoursAgo = (date) => {
  if (!date) return '';
  
  const lastScraped = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - lastScraped;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours === 0) {
    return `(${diffMinutes} min ago)`;
  } else if (diffHours < 24) {
    return `(${diffHours} hours ago)`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `(${diffDays} days ago)`;
  }
};

/**
 * Company Information Card Component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.company - Company data
 * @param {Function} props.onStartScraping - Start scraping handler
 * @param {boolean} props.isScrapingActive - Whether scraping is active
 * @param {boolean} props.showScrapingButton - Whether to show scraping button
 * @returns {JSX.Element} Company info card component
 */
const CompanyInfoCard = ({ 
  darkMode = false, 
  company, 
  onStartScraping,
  isScrapingActive = false,
  showScrapingButton = true
}) => {
  return (
    <div className={`rounded-xl shadow-lg border p-6 relative ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header with company name and type */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {company.name}
          </h2>
          <p className={`text-sm ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {company.type}
          </p>
        </div>
        {showScrapingButton && onStartScraping && (
          <button
            onClick={onStartScraping}
            disabled={isScrapingActive}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isScrapingActive
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isScrapingActive ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Scraping...
              </div>
            ) : (
              'Start Scraping'
            )}
          </button>
        )}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operations Column */}
        <div className="space-y-4">
          <h3 className={`font-semibold text-sm uppercase tracking-wide ${
            darkMode ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Operations
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Current Stock:
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {company.currentStock ? company.currentStock.toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Advertising Level:
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ${(company.advertisingCost || 0).toLocaleString()}/day
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Company Bank:
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ${company.companyBank.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Employees:
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {company.employeeCount}
              </span>
            </div>
          </div>
        </div>

        {/* Director Information Column */}
        <div className="space-y-4">
          <h3 className={`font-semibold text-sm uppercase tracking-wide ${
            darkMode ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Director Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Director:
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {company.director.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                TCP Status:
              </span>
              <span className={`font-medium ${
                company.hasTCP 
                  ? 'text-green-600' 
                  : darkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {company.hasTCP ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                TGP Status:
              </span>
              <span className={`font-medium ${
                company.hasTGP 
                  ? 'text-green-600' 
                  : darkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {company.hasTGP ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Education:
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {company.education || 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Scraped Info - Bottom Right */}
      {company.lastScraped && (
        <div className="absolute bottom-4 right-6">
          <div className={`text-xs ${
            darkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            <div>
              Last scraped: {(() => {
                const lastScraped = company.lastScraped;
                if (typeof lastScraped === 'string') {
                  return new Date(lastScraped).toLocaleString();
                } else if (lastScraped instanceof Date) {
                  return lastScraped.toLocaleString();
                } else {
                  return 'Unknown';
                }
              })()}
            </div>
            <div className={`text-right ${
              darkMode ? 'text-slate-500' : 'text-gray-400'
            }`}>
              {getHoursAgo(company.lastScraped)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInfoCard;