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
}

const apiService = new APIService();
export default apiService;
