/**
 * Client Context Provider
 * 
 * React context for managing client-side state including user authentication,
 * training data, and work statistics. Provides centralized state management
 * for all client-related operations.
 * 
 * @component
 * @example
 * // Wrap your app with ClientProvider
 * <ClientProvider>
 *   <App />
 * </ClientProvider>
 * 
 * // Use in components
 * const { user, training, verifyApiKey } = useClient();
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

/**
 * Client context object
 */
const ClientContext = createContext();

/**
 * Custom hook to use client context
 * 
 * @returns {Object} Client context value
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
 * Client state management provider
 * 
 * Manages client authentication, training data, and work statistics.
 * Provides methods for API key verification, data fetching, and state updates.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} ClientProvider component
 */
export const ClientProvider = ({ children }) => {
  // Core user state
  const [user, setUser] = useState(null);
  const [training, setTraining] = useState(null);
  const [currentStats, setCurrentStats] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Verify API key and authenticate user
   * 
   * @param {string} apiKey - 16-character Torn City API key
   * @returns {Promise<Object>} Result object with success status and error message
   */
  const verifyApiKey = async (apiKey) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Verifying API key...');
      
      // Validate API key format
      if (!apiKey || apiKey.length !== 16) {
        throw new Error('API key must be exactly 16 characters');
      }

      // Call API service
      const result = await apiService.verifyClient(apiKey);
      
      if (result.success) {
        const userData = result.user;
        setUser(userData);
        
        // Store user data in localStorage and API service
        apiService.setClientUser(userData);
        
        console.log('✅ User authenticated:', userData.name);
        
        // Load dashboard data immediately after authentication
        await loadDashboardData(userData.tornId);
        
        return { success: true };
      } else {
        const errorMessage = result.error || 'API key verification failed';
        setError(errorMessage);
        console.error('❌ API verification failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.message || 'Connection error - please try again';
      setError(errorMessage);
      console.error('❌ API verification error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load dashboard data including training status and current stats
   * 
   * @param {number} tornId - User's Torn City ID
   * @returns {Promise<boolean>} Success status
   */
  const loadDashboardData = async (tornId) => {
    try {
      console.log('📊 Loading dashboard data...');
      
      const result = await apiService.getClientDashboard(tornId);
      
      if (result.success) {
        setTraining(result.data.training);
        setCurrentStats(result.data.currentStats);
        setLastUpdated(new Date());
        
        console.log('✅ Dashboard data loaded');
        return true;
      } else {
        console.error('❌ Failed to load dashboard data:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Dashboard loading error:', error);
      setError('Failed to load dashboard data');
      return false;
    }
  };

  /**
   * Refresh all user data
   * 
   * @returns {Promise<boolean>} Success status
   */
  const refreshData = async () => {
    if (!user) {
      console.warn('⚠️ No user logged in, cannot refresh data');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await loadDashboardData(user.tornId);
      return success;
    } catch (error) {
      console.error('❌ Data refresh error:', error);
      setError('Failed to refresh data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and clear all data
   */
  const logout = () => {
    console.log('👋 Logging out user...');
    
    // Clear state
    setUser(null);
    setTraining(null);
    setCurrentStats(null);
    setError(null);
    setLastUpdated(null);
    
    // Clear stored data
    apiService.clearClientUser();
    
    console.log('✅ User logged out');
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Get formatted training status for display
   * 
   * @returns {Object} Formatted training status
   */
  const getTrainingStatus = () => {
    if (!training) {
      return {
        status: 'No Data',
        color: 'gray',
        message: 'Training data not loaded'
      };
    }

    if (training.currentStat === 'Not Assigned') {
      return {
        status: 'Awaiting Assignment',
        color: 'yellow',
        message: 'Contact your trainer for assignment'
      };
    }

    if (training.trainsRemaining === 0) {
      return {
        status: 'Complete',
        color: 'green',
        message: 'Training assignment completed!'
      };
    }

    if (training.trainsRemaining <= 5) {
      return {
        status: 'Almost Done',
        color: 'orange',
        message: `${training.trainsRemaining} sessions remaining`
      };
    }

    return {
      status: 'In Progress',
      color: 'blue',
      message: `${training.trainsRemaining} sessions remaining`
    };
  };

  /**
   * Get stat-specific emoji and color
   * 
   * @param {string} stat - Training stat name
   * @returns {Object} Stat display information
   */
  const getStatInfo = (stat) => {
    const statMap = {
      'Manual Labor': { emoji: '💪', color: 'red' },
      'Intelligence': { emoji: '🧠', color: 'blue' },
      'Endurance': { emoji: '🏃', color: 'green' },
      'Not Assigned': { emoji: '⏳', color: 'gray' }
    };

    return statMap[stat] || { emoji: '❓', color: 'gray' };
  };

  /**
   * Load user from localStorage on component mount
   */
  useEffect(() => {
    const savedUser = apiService.getClientUser();
    
    if (savedUser) {
      console.log('🔄 Restoring user session:', savedUser.name);
      setUser(savedUser);
      loadDashboardData(savedUser.tornId);
    }
  }, []);

  /**
   * Context value object
   */
  const value = {
    // State
    user,
    training,
    currentStats,
    loading,
    error,
    lastUpdated,
    
    // Actions
    verifyApiKey,
    refreshData,
    logout,
    clearError,
    
    // Computed values
    getTrainingStatus,
    getStatInfo,
    
    // Flags
    isAuthenticated: !!user,
    hasTraining: !!training && training.currentStat !== 'Not Assigned',
    hasStats: !!currentStats,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};