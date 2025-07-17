/**
 * Client Context Provider - State management for trains buyers (clients)
 * Handles API key verification, training data, and train requests
 * 
 * @file src/context/ClientContext.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Client context for managing trains buyer authentication and data
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
 * Client provider component for managing trains buyer authentication and data
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ClientProvider = ({ children }) => {
  // Authentication state
  const [client, setClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // Training data
  const [trainingData, setTrainingData] = useState(null);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Company data (relevant to client)
  const [companyInfo, setCompanyInfo] = useState(null);
  
  // UI state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [requestingTrains, setRequestingTrains] = useState(false);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Verify Torn API key and authenticate client
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

      // Verify with backend - check if user is a trains buyer
      const result = await apiService.verifyClient(apiKey);
      
      if (result.success) {
        const clientData = result.client;
        const companyData = result.company;
        
        setClient(clientData);
        setCompanyInfo(companyData);
        setIsAuthenticated(true);
        
        // Store client data in localStorage for persistence
        localStorage.setItem('client_user', JSON.stringify(clientData));
        localStorage.setItem('client_company', JSON.stringify(companyData));
        localStorage.setItem('client_authenticated', 'true');
        
        // Load full dashboard data after authentication
        await loadClientDashboard(clientData.tornId);
        
        return { success: true };
      } else {
        const errorMessage = result.error || 'Authentication failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Client API key verification error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Connection error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load complete client dashboard data
   * @param {number} tornId - Client's Torn City ID
   */
  const loadClientDashboard = async (tornId) => {
    try {
      const [trainingResult, historyResult, analyticsResult] = await Promise.all([
        apiService.getClientTrainingData(tornId),
        apiService.getClientTrainingHistory(tornId),
        apiService.getClientAnalytics(tornId)
      ]);
      
      if (trainingResult.success) {
        setTrainingData(trainingResult.data);
      }
      
      if (historyResult.success) {
        setTrainingHistory(historyResult.data);
      }
      
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Client dashboard data loading error:', error);
      setError('Failed to load training data. Please refresh the page.');
    }
  };

  /**
   * Request more trains from the company
   * @param {Object} requestData - Request details
   * @param {string} requestData.stat - Training stat (Manual Labor, Intelligence, Endurance)
   * @param {number} requestData.quantity - Number of trains requested
   * @param {number} requestData.targetLevel - Target level (optional)
   * @param {string} requestData.notes - Additional notes (optional)
   * @returns {Promise<Object>} Result object with success status
   */
  const requestTrains = async (requestData) => {
    if (!client) {
      setError('No client data available');
      return { success: false, error: 'No client data available' };
    }

    setRequestingTrains(true);
    setError(null);

    try {
      const result = await apiService.requestTrains({
        tornId: client.tornId,
        companyId: companyInfo.id,
        ...requestData
      });
      
      if (result.success) {
        // Refresh training data after request
        await loadClientDashboard(client.tornId);
        return { success: true, data: result.data };
      } else {
        const errorMessage = result.error || 'Train request failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Train request error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Train request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setRequestingTrains(false);
    }
  };

  /**
   * Calculate analytics for custom date range
   * @param {Date} startDate - Start date for analytics
   * @param {Date} endDate - End date for analytics
   * @returns {Promise<Object>} Analytics data for the specified range
   */
  const calculateAnalytics = async (startDate, endDate) => {
    if (!client) {
      return { success: false, error: 'No client data available' };
    }

    try {
      const result = await apiService.getClientAnalytics(client.tornId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error || 'Analytics calculation failed' };
      }
    } catch (error) {
      console.error('Analytics calculation error:', error);
      return { success: false, error: 'Analytics calculation failed' };
    }
  };

  /**
   * Refresh all client data
   * @returns {Promise<void>}
   */
  const refreshData = useCallback(async () => {
    if (client && isAuthenticated) {
      setLoading(true);
      setError(null);
      
      try {
        await loadClientDashboard(client.tornId);
      } catch (error) {
        console.error('Data refresh error:', error);
        setError('Failed to refresh data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [client, isAuthenticated]);

  /**
   * Logout client and clear all data
   */
  const logout = useCallback(() => {
    setClient(null);
    setCompanyInfo(null);
    setTrainingData(null);
    setTrainingHistory([]);
    setAnalytics(null);
    setIsAuthenticated(false);
    setError(null);
    setLastUpdated(null);
    setRequestingTrains(false);
    
    // Clear localStorage
    localStorage.removeItem('client_user');
    localStorage.removeItem('client_company');
    localStorage.removeItem('client_authenticated');
  }, []);

  /**
   * Auto-refresh data every 15 minutes when authenticated
   */
  useEffect(() => {
    if (isAuthenticated && client) {
      const interval = setInterval(() => {
        refreshData();
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, client, refreshData]);

  /**
   * Load client from localStorage on component mount
   */
  useEffect(() => {
    setInitializing(true);
    
    const savedClient = localStorage.getItem('client_user');
    const savedCompany = localStorage.getItem('client_company');
    const savedAuth = localStorage.getItem('client_authenticated');
    
    if (savedClient && savedCompany && savedAuth === 'true') {
      try {
        const clientData = JSON.parse(savedClient);
        const companyData = JSON.parse(savedCompany);
        
        setClient(clientData);
        setCompanyInfo(companyData);
        setIsAuthenticated(true);
        
        // Load fresh data
        loadClientDashboard(clientData.tornId);
      } catch (error) {
        console.error('Error loading saved client data:', error);
        // Clear corrupted data
        localStorage.removeItem('client_user');
        localStorage.removeItem('client_company');
        localStorage.removeItem('client_authenticated');
      }
    }
    
    setInitializing(false);
  }, []);

  /**
   * Context value object
   */
  const value = {
    // Authentication state
    client,
    isAuthenticated,
    initializing,
    
    // Training data
    trainingData,
    trainingHistory,
    analytics,
    
    // Company data
    companyInfo,
    
    // UI state
    loading,
    error,
    lastUpdated,
    requestingTrains,
    
    // Actions
    verifyApiKey,
    requestTrains,
    calculateAnalytics,
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