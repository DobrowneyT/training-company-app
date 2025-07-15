/**
 * Enhanced API Service with Admin Methods
 * Handles both client and admin API calls
 * 
 * @file src/services/api.js
 * @author Training Company App
 * @version 2.0.0
 */

import axios from 'axios';

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  TOKEN_STORAGE_KEY: 'admin_token',
  USER_STORAGE_KEY: 'admin_user',
  CLIENT_STORAGE_KEY: 'client_user',
};

class APIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, { headers: config.headers, data: config.data });
      }
      return config;
    }, (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    });

    this.client.interceptors.response.use((response) => {
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, { status: response.status, data: response.data });
      }
      return response;
    }, (error) => {
      if (error.response?.status === 401) {
        this.clearAuthData();
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      }
      if (!error.response) {
        console.error('Network Error:', error.message);
        error.message = 'Network connection failed. Please check your connection.';
      }
      return Promise.reject(error);
    });
  }

  clearAuthData() {
    localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(API_CONFIG.USER_STORAGE_KEY);
  }

  // ============================================================================
  // CLIENT API METHODS
  // ============================================================================

  async verifyClient(apiKey) {
    try {
      const response = await this.client.post('/client/verify', { apiKey: apiKey.trim() });
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to verify API key');
    }
  }

  async getClientDashboard(tornId) {
    try {
      const response = await this.client.get(`/client/dashboard/${tornId}`);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to load dashboard data');
    }
  }

  // ============================================================================
  // ADMIN API METHODS
  // ============================================================================

  /**
   * Admin login with username and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username - Admin username
   * @param {string} credentials.password - Admin password
   * @returns {Promise<Object>} Login response with token and admin data
   */
  async adminLogin(credentials) {
    try {
      const response = await this.client.post('/admin/login', credentials);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to login');
    }
  }

  /**
   * Get all companies with aggregated data
   * @returns {Promise<Object>} Companies list with statistics
   */
  async getAdminCompanies() {
    try {
      const response = await this.client.get('/admin/companies');
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to load companies');
    }
  }

  /**
   * Get admin analytics and statistics
   * @returns {Promise<Object>} Analytics data
   */
  async getAdminAnalytics() {
    try {
      const response = await this.client.get('/admin/analytics/overview');
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to load analytics');
    }
  }

  /**
   * Register a new company via API key
   * @param {Object} companyData - Company registration data
   * @param {string} companyData.apiKey - Company owner's API key
   * @returns {Promise<Object>} Registration response
   */
  async registerCompany(companyData) {
    try {
      const response = await this.client.post('/admin/companies/register', companyData);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to register company');
    }
  }

  /**
   * Update company settings
   * @param {string} companyId - Company ID
   * @param {Object} updates - Company updates
   * @returns {Promise<Object>} Update response
   */
  async updateCompany(companyId, updates) {
    try {
      const response = await this.client.put(`/admin/companies/${companyId}`, updates);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to update company');
    }
  }

  /**
   * Get detailed company information
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Detailed company data
   */
  async getCompanyDetails(companyId) {
    try {
      const response = await this.client.get(`/admin/companies/${companyId}/details`);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to load company details');
    }
  }

  /**
   * Add purchase record for company
   * @param {string} companyId - Company ID
   * @param {Object} purchaseData - Purchase data
   * @param {number} purchaseData.trainsPurchased - Number of trains purchased
   * @param {string} purchaseData.notes - Purchase notes
   * @returns {Promise<Object>} Purchase response
   */
  async addPurchase(companyId, purchaseData) {
    try {
      const response = await this.client.post(`/admin/companies/${companyId}/purchases`, purchaseData);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to add purchase');
    }
  }

  /**
   * Get purchase history for company
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Purchase history
   */
  async getPurchaseHistory(companyId) {
    try {
      const response = await this.client.get(`/admin/companies/${companyId}/purchases`);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to load purchase history');
    }
  }

  /**
   * Get all training requests
   * @returns {Promise<Object>} Training requests
   */
  async getTrainingRequests() {
    try {
      const response = await this.client.get('/admin/training-requests');
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to load training requests');
    }
  }

  /**
   * Approve training request
   * @param {string} requestId - Request ID
   * @param {Object} approvalData - Approval data
   * @returns {Promise<Object>} Approval response
   */
  async approveTrainingRequest(requestId, approvalData) {
    try {
      const response = await this.client.put(`/admin/training-requests/${requestId}/approve`, approvalData);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to approve request');
    }
  }

  /**
   * Reject training request
   * @param {string} requestId - Request ID
   * @param {Object} rejectionData - Rejection data
   * @returns {Promise<Object>} Rejection response
   */
  async rejectTrainingRequest(requestId, rejectionData) {
    try {
      const response = await this.client.put(`/admin/training-requests/${requestId}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to reject request');
    }
  }

  /**
   * Mark payment received for training request
   * @param {string} requestId - Request ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment response
   */
  async markPaymentReceived(requestId, paymentData) {
    try {
      const response = await this.client.put(`/admin/training-requests/${requestId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to mark payment');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async testConnection() {
    try {
      const response = await this.client.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  handleAPIError(error, defaultMessage) {
    let message = defaultMessage;
    if (error.response?.data?.error) message = error.response.data.error;
    else if (error.response?.data?.message) message = error.response.data.message;
    else if (error.message) message = error.message;
    
    const apiError = new Error(message);
    apiError.status = error.response?.status;
    apiError.code = error.code;
    apiError.original = error;
    return apiError;
  }

  getClientUser() {
    const userData = localStorage.getItem(API_CONFIG.CLIENT_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setClientUser(userData) {
    localStorage.setItem(API_CONFIG.CLIENT_STORAGE_KEY, JSON.stringify(userData));
  }

  clearClientUser() {
    localStorage.removeItem(API_CONFIG.CLIENT_STORAGE_KEY);
  }

  getAdminUser() {
    const userData = localStorage.getItem(API_CONFIG.USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setAdminUser(userData) {
    localStorage.setItem(API_CONFIG.USER_STORAGE_KEY, JSON.stringify(userData));
  }

  clearAdminUser() {
    localStorage.removeItem(API_CONFIG.USER_STORAGE_KEY);
  }
}

const apiService = new APIService();
export default apiService;