import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const ClientContext = createContext();

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

export const ClientProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [training, setTraining] = useState(null);
  const [currentStats, setCurrentStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const verifyApiKey = async (apiKey) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Verifying API key...');
      
      if (!apiKey || apiKey.length !== 16) {
        throw new Error('API key must be exactly 16 characters');
      }

      const result = await apiService.verifyClient(apiKey);
      
      if (result.success) {
        const userData = result.user;
        setUser(userData);
        apiService.setClientUser(userData);
        console.log('✅ User authenticated:', userData.name);
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

  const logout = () => {
    console.log('👋 Logging out user...');
    setUser(null);
    setTraining(null);
    setCurrentStats(null);
    setError(null);
    setLastUpdated(null);
    apiService.clearClientUser();
    console.log('✅ User logged out');
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    const savedUser = apiService.getClientUser();
    if (savedUser) {
      console.log('🔄 Restoring user session:', savedUser.name);
      setUser(savedUser);
      loadDashboardData(savedUser.tornId);
    }
  }, []);

  const value = {
    user, training, currentStats, loading, error, lastUpdated,
    verifyApiKey, refreshData, logout, clearError,
    isAuthenticated: !!user,
    hasTraining: !!training && training.currentStat !== 'Not Assigned',
    hasStats: !!currentStats,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};
