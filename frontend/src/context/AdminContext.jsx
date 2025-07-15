/**
 * Admin Context Provider - JWT Authentication and Company Management
 * Handles admin login, token management, and company data fetching
 * 
 * @file src/context/AdminContext.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

const AdminContext = createContext();

/**
 * Hook to access admin context
 * @returns {Object} Admin context value with state and methods
 * @throws {Error} If used outside of AdminProvider
 */
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

/**
 * Admin provider component for managing authentication and admin data
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AdminProvider = ({ children }) => {
  // Authentication state
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // Company data state
  const [companies, setCompanies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // UI state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Login admin with username and password
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Result object with success status
   */
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.adminLogin({ username, password });
      
      if (result.success) {
        const { token, admin: adminData } = result.data;
        
        // Store authentication data
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(adminData));
        
        setAdmin(adminData);
        setIsAuthenticated(true);
        
        // Load initial data
        await Promise.all([
          loadCompanies(),
          loadAnalytics()
        ]);
        
        return { success: true };
      } else {
        const errorMessage = result.error || 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Connection error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load companies data from API
   */
  const loadCompanies = async () => {
    try {
      const result = await apiService.getAdminCompanies();
      
      if (result.success) {
        // Extract companies array from the API response
        setCompanies(result.data.companies || []);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to load companies:', result.error);
        setError('Failed to load companies data');
      }
    } catch (error) {
      console.error('Companies loading error:', error);
      setError('Connection error while loading companies');
    }
  };

  /**
   * Load analytics data from API
   */
  const loadAnalytics = async () => {
    try {
      const result = await apiService.getAdminAnalytics();
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        console.error('Failed to load analytics:', result.error);
      }
    } catch (error) {
      console.error('Analytics loading error:', error);
    }
  };

  /**
   * Refresh all admin data
   */
  const refreshData = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          loadCompanies(),
          loadAnalytics()
        ]);
      } catch (error) {
        console.error('Data refresh error:', error);
        setError('Failed to refresh data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  /**
   * Logout admin and clear all data
   */
  const logout = useCallback(() => {
    setAdmin(null);
    setIsAuthenticated(false);
    setCompanies([]);
    setAnalytics(null);
    setError(null);
    setLastUpdated(null);
    
    // Clear localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }, []);

  /**
   * Auto-refresh data every 5 minutes when authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshData();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshData]);

  /**
   * Load admin from localStorage on component mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('admin_token');
      const savedAdmin = localStorage.getItem('admin_user');
      
      if (savedToken && savedAdmin) {
        try {
          const adminData = JSON.parse(savedAdmin);
          setAdmin(adminData);
          setIsAuthenticated(true);
          
          // Load fresh data
          await Promise.all([
            loadCompanies(),
            loadAnalytics()
          ]);
        } catch (error) {
          console.error('Error loading saved admin data:', error);
          // Clear corrupted data
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      }
      
      setInitializing(false);
    };

    initializeAuth();
  }, []);

  /**
   * Context value object
   */
  const value = {
    // Authentication state
    admin,
    isAuthenticated,
    initializing,
    
    // Data state
    companies,
    analytics,
    lastUpdated,
    
    // UI state
    loading,
    error,
    
    // Actions
    login,
    logout,
    refreshData,
    clearError,
    loadCompanies,
    loadAnalytics
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};