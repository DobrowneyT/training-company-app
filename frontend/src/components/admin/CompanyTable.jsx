/**
 * Company Table Component - Google Sheet Style Layout
 * Displays companies in expandable table format
 * 
 * @file src/components/admin/CompanyTable.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React, { useState } from 'react';

/**
 * Get company type name from number
 * @param {number} companyType - Company type number
 * @returns {string} Company type name
 */
const getCompanyTypeName = (companyType) => {
  const types = {
    12: 'Fireworks Stand',
    25: 'Pub',
    // Add more company types as needed
  };
  return types[companyType] || `Type ${companyType}`;
};

/**
 * Format large numbers with thousand separators
 * @param {number|string} num - Number to format
 * @returns {string} Formatted number string
 */
const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return 'N/A';
  const number = typeof num === 'string' ? parseInt(num) : num;
  if (isNaN(number)) return 'N/A';
  return number.toLocaleString();
};

/**
 * Calculate trains remaining (purchased - distributed)
 * @param {number} purchased - Total trains purchased
 * @param {number} distributed - Total trains distributed
 * @returns {number} Trains remaining
 */
const calculateTrainsRemaining = (purchased, distributed) => {
  return (purchased || 0) - (distributed || 0);
};

/**
 * Calculate estimated days remaining
 * @param {number} remaining - Trains remaining
 * @param {number} avgPerDay - Average trains per day (default 5)
 * @returns {number} Days remaining (can be negative)
 */
const getDaysRemaining = (remaining, avgPerDay = 5) => {
  if (avgPerDay === 0) return 0;
  return Math.round((remaining / avgPerDay) * 10) / 10;
};

/**
 * Get status color based on trains remaining
 * @param {number} remaining - Trains remaining
 * @returns {string} Tailwind color class
 */
const getStatusColor = (remaining) => {
  if (remaining < 0) return 'text-red-400';
  if (remaining < 50) return 'text-yellow-400';
  return 'text-green-400';
};

/**
 * Company Row Component
 * @param {Object} props - Component props
 * @param {Object} props.company - Company data
 * @param {boolean} props.isExpanded - Whether row is expanded
 * @param {Function} props.onToggle - Toggle expansion function
 */
const CompanyRow = ({ company, isExpanded, onToggle }) => {
  const trainsRemaining = calculateTrainsRemaining(
    company.totalTrainsPurchased || 0,
    0 // We don't have distributed count yet, using 0
  );
  
  const daysRemaining = getDaysRemaining(trainsRemaining);

  return (
    <>
      {/* Main Row */}
      <tr 
        className="border-b border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        {/* Expand Button */}
        <td className="px-4 py-3 text-center">
          <button className="text-slate-400 hover:text-white transition-colors">
            <svg 
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </td>

        {/* Company Name */}
        <td className="px-4 py-3">
          <div className="text-white font-medium">{company.name}</div>
          <div className="text-sm text-slate-400">{getCompanyTypeName(company.companyType)}</div>
        </td>

        {/* Owner */}
        <td className="px-4 py-3">
          <div className="text-white">{company.owner?.name || 'Unknown'}</div>
          <div className="text-sm text-slate-400">ID: {company.owner?.tornId || 'N/A'}</div>
        </td>

        {/* Trains Buyer */}
        <td className="px-4 py-3">
          {company.trainsBuyer ? (
            <>
              <div className="text-white">{company.trainsBuyer.name}</div>
              <div className="text-sm text-slate-400">ID: {company.trainsBuyer.tornId}</div>
            </>
          ) : (
            <div className="text-slate-400">Not assigned</div>
          )}
        </td>

        {/* TCP/TGP Status */}
        <td className="px-4 py-3">
          <div className="flex space-x-2">
            <span className={`px-2 py-1 text-xs rounded ${company.hasTCP ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
              TCP: {company.hasTCP ? 'Yes' : 'No'}
            </span>
            <span className={`px-2 py-1 text-xs rounded ${company.hasTGP ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
              TGP: {company.hasTGP ? 'Yes' : 'No'}
            </span>
          </div>
        </td>

        {/* Trains Purchased */}
        <td className="px-4 py-3 text-white font-mono">
          {formatNumber(company.totalTrainsPurchased)}
        </td>

        {/* Trains Remaining */}
        <td className="px-4 py-3">
          <span className={`font-mono font-medium ${getStatusColor(trainsRemaining)}`}>
            {trainsRemaining > 0 ? '+' : ''}{trainsRemaining}
          </span>
        </td>

        {/* Days Remaining */}
        <td className="px-4 py-3">
          <span className={`font-mono ${getStatusColor(trainsRemaining)}`}>
            {daysRemaining > 0 ? '+' : ''}{daysRemaining}d
          </span>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span className={`px-2 py-1 text-xs rounded ${
            trainsRemaining < 0 
              ? 'bg-red-900 text-red-300' 
              : trainsRemaining < 50 
                ? 'bg-yellow-900 text-yellow-300' 
                : 'bg-green-900 text-green-300'
          }`}>
            {trainsRemaining < 0 ? 'Deficit' : trainsRemaining < 50 ? 'Low' : 'Good'}
          </span>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {isExpanded && (
        <tr className="bg-slate-700/30 border-b border-slate-600">
          <td colSpan="9" className="px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Company Details */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Company Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company ID:</span>
                    <span className="text-white font-mono">{company.tornId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="text-white">{getCompanyTypeName(company.companyType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Employees:</span>
                    <span className="text-white">{company.employeeCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trains Available:</span>
                    <span className="text-white">{formatNumber(company.trainsAvailable)}</span>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Financial Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company Bank:</span>
                    <span className="text-white font-mono">${formatNumber(company.companyBank)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company Value:</span>
                    <span className="text-white font-mono">${formatNumber(company.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Income:</span>
                    <span className="text-white font-mono">${formatNumber(company.dailyIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rating:</span>
                    <span className="text-white">{company.rating || 'N/A'}/10</span>
                  </div>
                </div>
              </div>

              {/* Training Info */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Training Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pending Requests:</span>
                    <span className="text-white">{company.pendingRequests || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Requested Trains:</span>
                    <span className="text-white">{formatNumber(company.totalRequestedTrains)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Advertising:</span>
                    <span className="text-white text-right">{company.advertising || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Synced:</span>
                    <span className="text-white">
                      {company.lastSynced ? new Date(company.lastSynced).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                View Details
              </button>
              <button className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                Add Purchase
              </button>
              <button className="px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors">
                Edit Settings
              </button>
              <button className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                View Employees
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

/**
 * Company Table Component
 * @param {Object} props - Component props
 * @param {Array} props.companies - Array of company objects
 * @param {boolean} props.loading - Loading state
 */
const CompanyTable = ({ companies = [], loading }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  /**
   * Toggle row expansion
   * @param {string} companyId - Company ID to toggle
   */
  const toggleRow = (companyId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedRows(newExpanded);
  };

  // Show empty state if no companies
  if (!loading && companies.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-white text-lg font-medium mb-2">No Companies Found</h3>
        <p className="text-slate-400 mb-6">No training companies have been registered yet.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Register First Company
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* Table Header */}
        <thead className="bg-slate-700/30">
          <tr className="text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
            <th className="px-4 py-3 w-8"></th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Trains Buyer</th>
            <th className="px-4 py-3">TCP/TGP</th>
            <th className="px-4 py-3">Purchased</th>
            <th className="px-4 py-3">Remaining</th>
            <th className="px-4 py-3">Days Left</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {companies.map((company) => (
            <CompanyRow
              key={company.id}
              company={company}
              isExpanded={expandedRows.has(company.id)}
              onToggle={() => toggleRow(company.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;