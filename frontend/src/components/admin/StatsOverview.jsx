/**
 * Stats Overview Component - Key Metrics Display
 * Shows important statistics cards for the admin dashboard
 * 
 * @file src/components/admin/StatsOverview.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';

/**
 * Individual Stat Card Component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Card value
 * @param {string} props.change - Change indicator (optional)
 * @param {string} props.icon - Icon component
 * @param {string} props.color - Color theme (blue, green, yellow, red)
 * @param {boolean} props.loading - Loading state
 */
const StatCard = ({ title, value, change, icon, color = 'blue', loading }) => {
  const colorClasses = {
    blue: 'bg-blue-600 text-blue-100',
    green: 'bg-green-600 text-green-100',
    yellow: 'bg-yellow-600 text-yellow-100',
    red: 'bg-red-600 text-red-100',
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-slate-600 rounded"></div>
            <div className="w-12 h-6 bg-slate-600 rounded"></div>
          </div>
          <div className="w-20 h-8 bg-slate-600 rounded mb-2"></div>
          <div className="w-16 h-4 bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded ${colorClasses[color]}`}>
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-medium ${
            change.startsWith('+') ? 'text-green-400' : 'text-red-400'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {value?.toLocaleString?.() || value || '0'}
      </div>
      <div className="text-sm text-slate-400">
        {title}
      </div>
    </div>
  );
};

/**
 * Stats Overview Component
 * @param {Object} props - Component props
 * @param {Object} props.analytics - Analytics data object
 * @param {boolean} props.loading - Loading state
 */
const StatsOverview = ({ analytics, loading }) => {
  // Default stats if no analytics data
  const defaultStats = {
    totalCompanies: 0,
    totalEmployees: 0,
    totalTrainsPurchased: 0,
    pendingRequests: 0,
    approvedRequestsToday: 0,
    completedSessionsToday: 0,
  };

  const stats = analytics || defaultStats;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Companies */}
        <StatCard
          title="Active Companies"
          value={stats.totalCompanies}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="blue"
          loading={loading}
        />

        {/* Total Employees */}
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          color="green"
          loading={loading}
        />

        {/* Total Trains Purchased */}
        <StatCard
          title="Trains Purchased"
          value={stats.totalTrainsPurchased}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="yellow"
          loading={loading}
        />

        {/* Pending Requests */}
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color={stats.pendingRequests > 0 ? 'red' : 'green'}
          loading={loading}
        />

        {/* Approved Today */}
        <StatCard
          title="Approved Today"
          value={stats.approvedRequestsToday}
          change={stats.approvedRequestsToday > 0 ? `+${stats.approvedRequestsToday}` : null}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          loading={loading}
        />

        {/* Completed Today */}
        <StatCard
          title="Sessions Today"
          value={stats.completedSessionsToday}
          change={stats.completedSessionsToday > 0 ? `+${stats.completedSessionsToday}` : null}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="blue"
          loading={loading}
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-white font-medium">Quick Actions</div>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
              Register Company
            </button>
            <button className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
              Add Purchase
            </button>
            <button className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
              View Queue
            </button>
            <button className="px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;