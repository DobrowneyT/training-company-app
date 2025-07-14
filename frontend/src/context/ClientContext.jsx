/**
 * Client Context Provider - Complete state management for client authentication and data
 * Handles API key verification, user data, training status, and work stats
 * 
 * @file src/context/ClientContext.jsx
 * @author Training Company App
 * @version 2.0.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Client context for managing user authentication and training data
 */
const ClientContext = createContext();

/**
 * Hook to access client context
 * @returns {Object} Client context value with state and methods
 * @throws {Error} If used outside of ClientProvider
 */
export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

/**
 * Client provider component for managing authentication and user data
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ClientProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Training and stats data
  const [training, setTraining] = useState(null);
  const [currentStats, setCurrentStats] = useState(null);
  
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
   * Verify Torn API key and authenticate user
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

      // Verify with backend
      const result = await apiService.verifyClient(apiKey);
      
      if (result.success) {
        const userData = result.user;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('client_user', JSON.stringify(userData));
        localStorage.setItem('client_authenticated', 'true');
        
        // Load dashboard data immediately after authentication
        await loadDashboardData(userData.tornId);
        
        return { success: true };
      } else {
        const errorMessage = result.error || 'Authentication failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('API key verification error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Connection error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load complete dashboard data for authenticated user
   * @param {number} tornId - User's Torn City ID
   */
  const loadDashboardData = async (tornId) => {
    try {
      const result = await apiService.getClientDashboard(tornId);
      
      if (result.success) {
        setTraining(result.data.training);
        setCurrentStats(result.data.currentStats);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to load dashboard data:', result.error);
        setError('Failed to load training data. Please refresh the page.');
      }
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      setError('Connection error while loading data. Please check your internet connection.');
    }
  };

  /**
   * Refresh all user data
   * @returns {Promise<void>}
   */
  const refreshData = useCallback(async () => {
    if (user && isAuthenticated) {
      setLoading(true);
      setError(null);
      
      try {
        await loadDashboardData(user.tornId);
      } catch (error) {
        console.error('Data refresh error:', error);
        setError('Failed to refresh data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [user, isAuthenticated]);

  /**
   * Logout user and clear all data
   */
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setTraining(null);
    setCurrentStats(null);
    setError(null);
    setLastUpdated(null);
    
    // Clear localStorage
    localStorage.removeItem('client_user');
    localStorage.removeItem('client_authenticated');
  }, []);

  /**
   * Auto-refresh data every 5 minutes when authenticated
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      const interval = setInterval(() => {
        refreshData();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, refreshData]);

  /**
   * Load user from localStorage on component mount
   */
  useEffect(() => {
    const savedUser = localStorage.getItem('client_user');
    const savedAuth = localStorage.getItem('client_authenticated');
    
    if (savedUser && savedAuth === 'true') {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Load fresh data
        loadDashboardData(userData.tornId);
      } catch (error) {
        console.error('Error loading saved user data:', error);
        // Clear corrupted data
        localStorage.removeItem('client_user');
        localStorage.removeItem('client_authenticated');
      }
    }
  }, []);

  /**
   * Context value object
   */
  const value = {
    // Authentication state
    user,
    isAuthenticated,
    
    // Data state
    training,
    currentStats,
    lastUpdated,
    
    // UI state
    loading,
    error,
    
    // Actions
    verifyApiKey,
    refreshData,
    logout,
    clearError
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};