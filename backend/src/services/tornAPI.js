/**
 * Enhanced Torn API Service with Railway-optimized error handling
 * Includes detailed logging and Railway-specific optimizations
 * 
 * @file backend/src/services/tornAPI.js
 * @author Training Company App
 * @version 2.0.0 (Railway Optimized)
 */

const axios = require('axios');

class TornAPIService {
  constructor() {
    this.baseURL = 'https://api.torn.com/v2';
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
    this.timeout = 15000; // 15 second timeout for Railway
    
    // Track API call statistics
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      lastError: null
    };
  }

  /**
   * Enhanced logging for production debugging
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      service: 'TornAPI',
      level,
      message,
      ...data
    };
    
    console.log(`[${timestamp}] TornAPI ${level.toUpperCase()}: ${message}`, 
      Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Rate limiting with improved timing
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      this.log('info', `Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Enhanced HTTP request with Railway optimizations
   * @param {string} url - Full API URL
   * @param {string} description - Description for logging
   * @returns {Promise<Object>} API response data
   */
  async makeRequest(url, description = 'API request') {
    await this.rateLimit();
    
    this.stats.totalCalls++;
    const requestId = `req_${this.stats.totalCalls}_${Date.now()}`;
    
    this.log('info', `Starting ${description}`, {
      requestId,
      url: url.replace(/key=[a-zA-Z0-9]+/, 'key=***'),
      timeout: this.timeout
    });

    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'TrainingCompanyApp/2.0 (Railway Production)',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        // Railway-specific configurations
        maxRedirects: 3,
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });

      this.log('info', `HTTP response received`, {
        requestId,
        status: response.status,
        statusText: response.statusText,
        headers: {
          'content-type': response.headers['content-type'],
          'content-length': response.headers['content-length']
        }
      });

      // Check for Torn API specific errors
      if (response.data && response.data.error) {
        const tornError = response.data.error;
        this.log('error', `Torn API error`, {
          requestId,
          errorCode: tornError.code,
          errorMessage: tornError.error,
          httpStatus: response.status
        });
        
        this.stats.failedCalls++;
        this.stats.lastError = `Torn API Error ${tornError.code}: ${tornError.error}`;
        
        throw new Error(`Torn API Error ${tornError.code}: ${tornError.error}`);
      }

      // Check for HTTP errors
      if (response.status >= 400) {
        this.log('error', `HTTP error response`, {
          requestId,
          status: response.status,
          statusText: response.statusText,
          responseData: response.data
        });
        
        this.stats.failedCalls++;
        this.stats.lastError = `HTTP ${response.status}: ${response.statusText}`;
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.stats.successfulCalls++;
      this.log('info', `${description} completed successfully`, {
        requestId,
        dataSize: JSON.stringify(response.data).length
      });

      return response.data;

    } catch (error) {
      this.stats.failedCalls++;
      
      // Detailed error analysis
      if (error.code === 'ENOTFOUND') {
        this.stats.lastError = 'DNS resolution failed - cannot reach api.torn.com';
        this.log('error', 'DNS resolution failed', {
          requestId,
          hostname: 'api.torn.com',
          errorCode: error.code,
          suggestion: 'Check if Railway has DNS restrictions'
        });
        throw new Error('Unable to reach Torn City API. This may be a network configuration issue.');
        
      } else if (error.code === 'ECONNREFUSED') {
        this.stats.lastError = 'Connection refused by Torn API';
        this.log('error', 'Connection refused', {
          requestId,
          errorCode: error.code,
          suggestion: 'Torn API may be blocking Railway IP addresses'
        });
        throw new Error('Connection to Torn City API was refused. The API may be temporarily unavailable.');
        
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        this.stats.lastError = `Request timeout after ${this.timeout}ms`;
        this.log('error', 'Request timeout', {
          requestId,
          timeout: this.timeout,
          errorCode: error.code,
          suggestion: 'Consider increasing timeout or checking Railway network speed'
        });
        throw new Error('Request to Torn City API timed out. Please try again.');
        
      } else if (error.response) {
        // HTTP error with response
        this.stats.lastError = `HTTP ${error.response.status}: ${error.response.statusText}`;
        this.log('error', 'HTTP error response', {
          requestId,
          status: error.response.status,
          statusText: error.response.statusText,
          responseData: error.response.data,
          headers: error.response.headers
        });
        throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}`);
        
      } else if (error.request) {
        // Network error without response
        this.stats.lastError = 'Network error - no response received';
        this.log('error', 'Network error - no response', {
          requestId,
          errorMessage: error.message,
          errorCode: error.code,
          suggestion: 'Check Railway network connectivity to external APIs'
        });
        throw new Error('Network error occurred while contacting Torn City API. Please check your connection.');
        
      } else {
        // Other error
        this.stats.lastError = error.message;
        this.log('error', 'Unknown error', {
          requestId,
          errorMessage: error.message,
          errorStack: error.stack
        });
        throw new Error(`Unexpected error: ${error.message}`);
      }
    }
  }

  /**
   * Verify API key with enhanced error handling
   * @param {string} apiKey - Torn City API key
   * @returns {Promise<Object>} User profile data
   */
  async verifyAPIKey(apiKey) {
    if (!apiKey || apiKey.length !== 16) {
      throw new Error('Invalid API key format. Must be exactly 16 characters.');
    }

    const url = `${this.baseURL}/user/profile?key=${apiKey}`;
    return this.makeRequest(url, 'API key verification');
  }

  /**
   * Get user work statistics
   * @param {string} apiKey - Torn City API key
   * @returns {Promise<Object>} Work stats data
   */
  async getUserWorkStats(apiKey) {
    if (!apiKey || apiKey.length !== 16) {
      throw new Error('Invalid API key format. Must be exactly 16 characters.');
    }

    const url = `${this.baseURL}/user/workstats?key=${apiKey}`;
    return this.makeRequest(url, 'Work stats retrieval');
  }

  /**
   * Get user basic information
   * @param {string} apiKey - Torn City API key
   * @returns {Promise<Object>} Basic user data
   */
  async getUserBasicInfo(apiKey) {
    if (!apiKey || apiKey.length !== 16) {
      throw new Error('Invalid API key format. Must be exactly 16 characters.');
    }

    const url = `${this.baseURL}/user/basic?key=${apiKey}`;
    return this.makeRequest(url, 'Basic user info retrieval');
  }

  /**
   * Get service statistics for debugging
   * @returns {Object} Service statistics
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalCalls > 0 
        ? (this.stats.successfulCalls / this.stats.totalCalls * 100).toFixed(2) + '%'
        : '0%',
      uptime: process.uptime()
    };
  }

  /**
   * Test connectivity to Torn API
   * @returns {Promise<Object>} Test results
   */
  async testConnectivity() {
    const testStart = Date.now();
    
    try {
      // Simple connectivity test (no API key required)
      const response = await axios.get('https://api.torn.com/v2', {
        timeout: 5000,
        headers: {
          'User-Agent': 'TrainingCompanyApp/2.0 (Connectivity Test)'
        }
      });
      
      const duration = Date.now() - testStart;
      
      return {
        success: true,
        duration: duration,
        status: response.status,
        message: 'Connectivity test successful'
      };
      
    } catch (error) {
      const duration = Date.now() - testStart;
      
      return {
        success: false,
        duration: duration,
        error: error.code || 'UNKNOWN',
        message: error.message,
        suggestion: this.getSuggestionForError(error)
      };
    }
  }

  /**
   * Get suggestion based on error type
   * @param {Error} error - The error object
   * @returns {string} Suggestion for fixing the error
   */
  getSuggestionForError(error) {
    if (error.code === 'ENOTFOUND') {
      return 'DNS resolution failed. Check if Railway allows external API calls.';
    } else if (error.code === 'ECONNREFUSED') {
      return 'Connection refused. Torn API may be blocking Railway IP addresses.';
    } else if (error.code === 'ETIMEDOUT') {
      return 'Request timeout. Railway network may be slow or Torn API is overloaded.';
    }
    return 'Unknown network error. Check Railway logs for more details.';
  }
}

// Export singleton instance
module.exports = new TornAPIService();


// /**
//  * @fileoverview Torn City API integration service
//  * @description Handles all interactions with the Torn City API including rate limiting
//  * @version 1.0.0
//  */

// const axios = require('axios');

// /**
//  * Torn API service class
//  * @class TornAPIService
//  */
// class TornAPIService {
//   /**
//    * Create TornAPIService instance
//    * @constructor
//    */
//   constructor() {
//     /** @type {string} Base URL for Torn API */
//     this.baseURL = 'https://api.torn.com';
    
//     /** @type {number} Rate limit delay in milliseconds */
//     this.rateLimitDelay = parseInt(process.env.TORN_API_RATE_LIMIT) || 1000;
    
//     /** @type {number} API timeout in milliseconds */
//     this.timeout = parseInt(process.env.TORN_API_TIMEOUT) || 10000;
    
//     /** @type {number} Timestamp of last API request */
//     this.lastRequestTime = 0;
    
//     console.log(`Torn API Service initialized with ${this.rateLimitDelay}ms rate limit`);
//   }

//   /**
//    * Make rate-limited request to Torn API
//    * @async
//    * @function makeRequest
//    * @param {string} url - Full API URL to request
//    * @returns {Promise<Object>} API response data
//    * @throws {Error} If request fails
//    */
//   async makeRequest(url) {
//     // Implement rate limiting
//     const now = Date.now();
//     const timeSinceLastRequest = now - this.lastRequestTime;
    
//     if (timeSinceLastRequest < this.rateLimitDelay) {
//       const waitTime = this.rateLimitDelay - timeSinceLastRequest;
//       console.log(`Rate limiting: waiting ${waitTime}ms`);
//       await new Promise(resolve => setTimeout(resolve, waitTime));
//     }
    
//     this.lastRequestTime = Date.now();

//     try {
//       console.log(`Making Torn API request: ${url}`);
      
//       const response = await axios.get(url, {
//         timeout: this.timeout,
//         headers: {
//           'User-Agent': 'TrainingCompanyApp/1.0',
//           'Accept': 'application/json'
//         }
//       });

//       // Check for Torn API errors
//       if (response.data.error) {
//         const error = response.data.error;
//         throw new Error(`Torn API Error ${error.code}: ${error.error}`);
//       }

//       console.log('Torn API request successful');
//       return response.data;
      
//     } catch (error) {
//       if (error.response) {
//         console.error(`Torn API HTTP Error: ${error.response.status} ${error.response.statusText}`);
//         throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}`);
//       } else if (error.request) {
//         console.error('Torn API timeout or network error');
//         throw new Error('API request timeout or network error');
//       } else {
//         console.error('Torn API request error:', error.message);
//         throw error;
//       }
//     }
//   }

//   /**
//    * Verify API key and get basic user info
//    * @async
//    * @function verifyAPIKey
//    * @param {string} apiKey - Torn API key to verify
//    * @returns {Promise<Object>} User profile data
//    * @throws {Error} If API key is invalid
//    */
//   async verifyAPIKey(apiKey) {
//     if (!apiKey || typeof apiKey !== 'string' || apiKey.length !== 16) {
//       throw new Error('Invalid API key format - must be 16 characters');
//     }
    
//     const url = `${this.baseURL}/user/?selections=profile&key=${apiKey}`;
//     const data = await this.makeRequest(url);
    
//     return {
//       player_id: data.player_id,
//       name: data.name,
//       level: data.level,
//       status: data.status,
//       last_action: data.last_action
//     };
//   }

//   /**
//    * Get user's work stats
//    * @async
//    * @function getUserWorkStats
//    * @param {string} apiKey - Torn API key
//    * @returns {Promise<Object>} Work stats data
//    * @throws {Error} If request fails
//    */
//   async getUserWorkStats(apiKey) {
//     if (!apiKey || typeof apiKey !== 'string' || apiKey.length !== 16) {
//       throw new Error('Invalid API key format - must be 16 characters');
//     }
    
//     const url = `${this.baseURL}/user/?selections=workstats&key=${apiKey}`;
//     const data = await this.makeRequest(url);
    
//     return {
//       manual_labor: data.manual_labor || 0,
//       intelligence: data.intelligence || 0,
//       endurance: data.endurance || 0
//     };
//   }

//   /**
//    * Get basic user information
//    * @async
//    * @function getUserBasicInfo
//    * @param {string} apiKey - Torn API key
//    * @returns {Promise<Object>} Basic user data
//    * @throws {Error} If request fails
//    */
//   async getUserBasicInfo(apiKey) {
//     if (!apiKey || typeof apiKey !== 'string' || apiKey.length !== 16) {
//       throw new Error('Invalid API key format - must be 16 characters');
//     }
    
//     const url = `${this.baseURL}/user/?selections=basic&key=${apiKey}`;
//     const data = await this.makeRequest(url);
    
//     return {
//       player_id: data.player_id,
//       name: data.name,
//       level: data.level,
//       gender: data.gender,
//       status: data.status
//     };
//   }

//   /**
//    * Test API service connectivity
//    * @async
//    * @function testConnection
//    * @returns {Promise<boolean>} True if service is working
//    */
//   async testConnection() {
//     try {
//       // Test with a minimal request (this will fail due to no API key, but tests connectivity)
//       const url = `${this.baseURL}/user/?selections=basic&key=invalid`;
//       await this.makeRequest(url);
//       return false; // Should not reach here
//     } catch (error) {
//       // We expect an "Incorrect key" error, which means the API is reachable
//       if (error.message.includes('Incorrect key') || error.message.includes('API Error 2')) {
//         console.log('Torn API service test: PASSED (API reachable)');
//         return true;
//       }
//       console.error('Torn API service test: FAILED -', error.message);
//       return false;
//     }
//   }
// }

// /**
//  * Singleton instance of TornAPIService
//  * @type {TornAPIService}
//  */
// const tornAPIService = new TornAPIService();

// module.exports = tornAPIService;
