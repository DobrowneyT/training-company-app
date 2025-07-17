/**
 * Director Context Provider - Complete state management for company director authentication and data
 * Handles API key verification, director data, company management, and employee oversight
 * 
 * @file src/context/DirectorContext.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Director context for managing company director authentication and data
 */
const DirectorContext = createContext();

/**
 * Hook to access director context
 * @returns {Object} Director context value with state and methods
 * @throws {Error} If used outside of DirectorProvider
 */
export const useDirector = () => {
  const context = useContext(DirectorContext);
  if (!context) {
    throw new Error('useDirector must be used within a DirectorProvider');
  }
  return context;
};

/**
 * Director provider component for managing director authentication and company data
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const DirectorProvider = ({ children }) => {
  // Authentication state
  const [director, setDirector] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // Company data
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [companyStats, setCompanyStats] = useState(null);
  
  // UI state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isScrapingActive, setIsScrapingActive] = useState(false);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Verify Torn API key and authenticate director
   * @param {string} apiKey - 16-character Torn API key
   * @returns {Promise<Object>} Result object with success status and error message if any
   */
  const verifyApiKey = async (apiKey) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate API key format
      if (!apiKey || apiKey.length !== 16) {
        throw new Error('API key must be exactly 16 characters');
      }

      // Verify with backend - check if user is a company director
      const result = await apiService.verifyDirector(apiKey);
      
      if (result.success) {
        const directorData = result.director;
        const companyData = result.company;
        
        setDirector(directorData);
        setCompany(companyData);
        setIsAuthenticated(true);
        
        // Store director data in localStorage for persistence
        localStorage.setItem('director_user', JSON.stringify(directorData));
        localStorage.setItem('director_company', JSON.stringify(companyData));
        localStorage.setItem('director_authenticated', 'true');
        
        // Load full dashboard data after authentication
        await loadDirectorDashboard(directorData.tornId, companyData.id);
        
        return { success: true };
      } else {
        const errorMessage = result.error || 'Authentication failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Director API key verification error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Connection error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load complete director dashboard data
   * @param {number} tornId - Director's Torn City ID
   * @param {string} companyId - Company ID
   */
  const loadDirectorDashboard = async (tornId, companyId) => {
    try {
      const [employeesResult, activityResult, statsResult] = await Promise.all([
        apiService.getCompanyEmployees(companyId),
        apiService.getCompanyActivity(companyId),
        apiService.getCompanyStats(companyId)
      ]);
      
      if (employeesResult.success) {
        setEmployees(employeesResult.data);
      }
      
      if (activityResult.success) {
        setActivityLog(activityResult.data);
      }
      
      if (statsResult.success) {
        setCompanyStats(statsResult.data);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Director dashboard data loading error:', error);
      setError('Failed to load company data. Please refresh the page.');
    }
  };

  /**
   * Start scraping company data from Torn API
   * @returns {Promise<Object>} Result object with success status
   */
  const startScraping = async () => {
    if (!company) {
      setError('No company data available');
      return { success: false, error: 'No company data available' };
    }

    setIsScrapingActive(true);
    setError(null);

    try {
      const result = await apiService.startCompanyScraping(company.id);
      
      if (result.success) {
        // Refresh company data after scraping
        await refreshCompanyData();
        return { success: true };
      } else {
        const errorMessage = result.error || 'Scraping failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Scraping error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Scraping failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsScrapingActive(false);
    }
  };

  /**
   * Refresh company data only
   * @returns {Promise<void>}
   */
  const refreshCompanyData = useCallback(async () => {
    if (company) {
      try {
        const result = await apiService.getCompanyData(company.id);
        if (result.success) {
          setCompany(result.data);
        }
      } catch (error) {
        console.error('Company data refresh error:', error);
      }
    }
  }, [company]);

  /**
   * Refresh all director data
   * @returns {Promise<void>}
   */
  const refreshData = useCallback(async () => {
    if (director && company && isAuthenticated) {
      setLoading(true);
      setError(null);
      
      try {
        await loadDirectorDashboard(director.tornId, company.id);
      } catch (error) {
        console.error('Data refresh error:', error);
        setError('Failed to refresh data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [director, company, isAuthenticated]);

  /**
   * Export company data
   * @returns {Promise<Object>} Result object with export data
   */
  const exportCompanyData = async () => {
    if (!company) {
      return { success: false, error: 'No company data available' };
    }

    try {
      const result = await apiService.exportCompanyData(company.id);
      return result;
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: 'Export failed' };
    }
  };

  /**
   * Logout director and clear all data
   */
  const logout = useCallback(() => {
    setDirector(null);
    setCompany(null);
    setEmployees([]);
    setActivityLog([]);
    setCompanyStats(null);
    setIsAuthenticated(false);
    setError(null);
    setLastUpdated(null);
    setIsScrapingActive(false);
    
    // Clear localStorage
    localStorage.removeItem('director_user');
    localStorage.removeItem('director_company');
    localStorage.removeItem('director_authenticated');
  }, []);

  /**
   * Auto-refresh data every 10 minutes when authenticated
   */
  useEffect(() => {
    if (isAuthenticated && director && company) {
      const interval = setInterval(() => {
        refreshData();
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, director, company, refreshData]);

  /**
   * Load director from localStorage on component mount
   */
  useEffect(() => {
    setInitializing(true);
    
    const savedDirector = localStorage.getItem('director_user');
    const savedCompany = localStorage.getItem('director_company');
    const savedAuth = localStorage.getItem('director_authenticated');
    
    if (savedDirector && savedCompany && savedAuth === 'true') {
      try {
        const directorData = JSON.parse(savedDirector);
        const companyData = JSON.parse(savedCompany);
        
        setDirector(directorData);
        setCompany(companyData);
        setIsAuthenticated(true);
        
        // Load fresh data
        loadDirectorDashboard(directorData.tornId, companyData.id);
      } catch (error) {
        console.error('Error loading saved director data:', error);
        // Clear corrupted data
        localStorage.removeItem('director_user');
        localStorage.removeItem('director_company');
        localStorage.removeItem('director_authenticated');
      }
    }
    
    setInitializing(false);
  }, []);

  /**
   * Context value object
   */
  const value = {
    // Authentication state
    director,
    isAuthenticated,
    initializing,
    
    // Company data
    company,
    employees,
    activityLog,
    companyStats,
    
    // UI state
    loading,
    error,
    lastUpdated,
    isScrapingActive,
    
    // Actions
    verifyApiKey,
    startScraping,
    refreshData,
    refreshCompanyData,
    exportCompanyData,
    logout,
    clearError
  };

  return (
    <DirectorContext.Provider value={value}>
      {children}
    </DirectorContext.Provider>
  );
};