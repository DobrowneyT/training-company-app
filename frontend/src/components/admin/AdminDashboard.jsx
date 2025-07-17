/**
 * AdminDashboard Component - Main admin dashboard with extracted components
 * Manages multiple training companies with company cards, stats, and modal
 * 
 * @file src/components/admin/AdminDashboard.jsx
 * @author Training Company App
 * @version 4.1.0 (Updated to use centralized mock data)
 */

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../layout/DashboardHeader';
import ViewToggle from '../common/ViewToggle';
import StatsCard, { StatsGrid } from '../stats/StatsCard';
import CompanyCard from '../company/CompanyCard';
import CompanyModal from '../company/CompanyModal';
import { 
  mockRealCompanies, 
  mockAdminUser, 
  calculateAnalytics,
  updateCompanyData 
} from '../../data/mockData';

/**
 * Detect user's OS color scheme preference
 * @returns {boolean} True if user prefers dark mode
 */
const detectOSColorScheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

/**
 * System Status Banner Component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.analytics - Analytics data
 * @returns {JSX.Element} System status banner
 */
const SystemStatusBanner = ({ darkMode, analytics }) => (
  <div className={`${
    darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-blue-50 border-blue-100'
  } border-b transition-colors duration-200`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className={`text-sm font-medium ${
              darkMode ? 'text-blue-300' : 'text-blue-900'
            }`}>System Status</span>
            <span className={`text-sm ml-2 ${
              darkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>
              All systems operational • {analytics.pendingRequests} critical companies
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Error Alert Component
 * @param {Object} props - Component props
 * @param {string} props.error - Error message
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onClear - Clear error handler
 * @returns {JSX.Element} Error alert component
 */
const ErrorAlert = ({ error, darkMode, onClear }) => {
  if (!error) return null;
  
  return (
    <div className={`mb-6 ${
      darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'
    } border rounded-lg p-4`}>
      <div className="flex items-start">
        <svg className={`w-5 h-5 mt-0.5 mr-3 ${
          darkMode ? 'text-red-400' : 'text-red-500'
        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h3 className={`text-sm font-medium mb-1 ${
            darkMode ? 'text-red-300' : 'text-red-800'
          }`}>Error</h3>
          <p className={`text-sm ${
            darkMode ? 'text-red-400' : 'text-red-700'
          }`}>{error}</p>
          <button
            onClick={onClear}
            className={`mt-2 text-xs underline ${
              darkMode ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-500'
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Companies Section Header Component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @param {string} props.viewMode - Current view mode
 * @param {Function} props.onToggleView - View toggle handler
 * @returns {JSX.Element} Companies section header
 */
const CompaniesSectionHeader = ({ darkMode, viewMode, onToggleView }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className={`text-2xl font-bold ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>Training Companies</h2>
      <p className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
        Manage your training companies and their status
      </p>
    </div>
    
    <div className="flex items-center space-x-3">
      <ViewToggle 
        viewMode={viewMode}
        onToggle={onToggleView}
        darkMode={darkMode}
      />
      
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
        Add Company
      </button>
    </div>
  </div>
);

/**
 * Empty State Component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @returns {JSX.Element} Empty state component
 */
const EmptyState = ({ darkMode }) => (
  <div className="text-center py-12">
    <div className={`w-16 h-16 ${
      darkMode ? 'bg-slate-700' : 'bg-gray-100'
    } rounded-full flex items-center justify-center mx-auto mb-4`}>
      <svg className={`w-8 h-8 ${
        darkMode ? 'text-slate-400' : 'text-gray-400'
      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>
    <h3 className={`text-lg font-medium mb-2 ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}>No Companies Found</h3>
    <p className={`mb-6 ${
      darkMode ? 'text-slate-400' : 'text-gray-600'
    }`}>No training companies have been registered yet.</p>
    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
      Register First Company
    </button>
  </div>
);

/**
 * Main AdminDashboard Component
 * @returns {JSX.Element} The admin dashboard
 */
const AdminDashboard = () => {
  // UI State
  const [darkMode, setDarkMode] = useState(() => detectOSColorScheme());
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);
  const [companyOrder, setCompanyOrder] = useState(mockRealCompanies.map(c => c.id));
  
  // Data State
  const [companies, setCompanies] = useState(mockRealCompanies);
  const [analytics, setAnalytics] = useState(calculateAnalytics());

  // Listen for OS color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update analytics when companies change
  useEffect(() => {
    setAnalytics(calculateAnalytics());
  }, [companies]);

  // Get ordered companies
  const orderedCompanies = companyOrder.map(id => companies.find(c => c.id === id)).filter(Boolean);

  // Prepare stats data for StatsGrid
  const statsData = [
    {
      id: 'companies',
      value: analytics.totalCompanies,
      label: 'Companies',
      iconType: 'companies'
    },
    {
      id: 'employees',
      value: analytics.totalEmployees,
      label: 'Employees',
      iconType: 'employees'
    },
    {
      id: 'trains',
      value: analytics.totalTrainsPurchased,
      label: 'Total Trains',
      iconType: 'trains'
    },
    {
      id: 'critical',
      value: analytics.pendingRequests,
      label: 'Critical',
      iconType: 'critical'
    }
  ];

  // Event Handlers
  const handleDragStart = (e, company) => {
    setDraggedItem(company.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', company.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, company) => {
    e.preventDefault();
    setDraggedOver(company.id);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedOver(null);
  };

  const handleDrop = (e, targetCompany) => {
    e.preventDefault();
    
    const draggedId = draggedItem;
    const targetId = targetCompany.id;
    
    if (draggedId === targetId) {
      setDraggedItem(null);
      setDraggedOver(null);
      return;
    }

    // Reorder companies
    const newOrder = [...companyOrder];
    const draggedIndex = newOrder.indexOf(draggedId);
    const targetIndex = newOrder.indexOf(targetId);
    
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);
    
    setCompanyOrder(newOrder);
    setDraggedItem(null);
    setDraggedOver(null);
  };

  const handleDragEnd = (e) => {
    setDraggedItem(null);
    setDraggedOver(null);
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompany(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const refreshData = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Refresh companies data
        setCompanies([...mockRealCompanies]);
        setAnalytics(calculateAnalytics());
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError('Failed to refresh data. Please try again.');
        console.error('Refresh error:', err);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const clearError = () => {
    setError(null);
  };

  const handleLogout = () => {
    // Clear any stored data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  };

  // Modal Action Handlers
  const handleAddTrains = (company) => {
    console.log('Add trains action for:', company?.name);
    
    // Simulate adding trains
    if (company) {
      const updatedCompany = updateCompanyData(company.id, {
        trainsRemaining: company.trainsRemaining + 50,
        totalTrainsPurchased: company.totalTrainsPurchased + 50
      });
      
      if (updatedCompany) {
        // Update local state
        setCompanies(prev => prev.map(c => 
          c.id === company.id ? updatedCompany : c
        ));
        setSelectedCompany(updatedCompany);
        console.log('Added 50 trains to', company.name);
      }
    }
  };

  const handleViewQueue = (company) => {
    console.log('View queue action for:', company?.name);
    // TODO: Implement view queue functionality
    // This would typically open a detailed view or navigate to a queue page
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode 
        ? 'bg-slate-950' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Header */}
      <DashboardHeader
        title="Training Admin"
        subtitle="Company Management"
        user={mockAdminUser}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onRefresh={refreshData}
        onLogout={handleLogout}
        loading={loading}
        lastUpdated={lastUpdated}
      />
      
      {/* System Status Banner */}
      <SystemStatusBanner darkMode={darkMode} analytics={analytics} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        <ErrorAlert 
          error={error}
          darkMode={darkMode}
          onClear={clearError}
        />

        {/* Stats Grid */}
        <StatsGrid 
          stats={statsData}
          darkMode={darkMode}
          className="mb-8"
        />
        
        {/* Companies Section Header */}
        <CompaniesSectionHeader 
          darkMode={darkMode}
          viewMode={viewMode}
          onToggleView={toggleViewMode}
        />
        
        {/* Companies Grid/List */}
        {orderedCompanies.length === 0 ? (
          <EmptyState darkMode={darkMode} />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-0'}>
            {orderedCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                viewMode={viewMode}
                onClick={handleCompanyClick}
                darkMode={darkMode}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragging={draggedItem === company.id}
                isDraggedOver={draggedOver === company.id}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Company Details Modal */}
      <CompanyModal
        company={selectedCompany}
        isOpen={showModal}
        onClose={closeModal}
        darkMode={darkMode}
        onAddTrains={() => handleAddTrains(selectedCompany)}
        onViewQueue={() => handleViewQueue(selectedCompany)}
      />
    </div>
  );
};

export default AdminDashboard;