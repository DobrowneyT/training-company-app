/**
 * @fileoverview Torn City API integration service
 * @description Handles all interactions with the Torn City API including rate limiting
 * @version 1.0.0
 */

const axios = require('axios');

/**
 * Torn API service class
 * @class TornAPIService
 */
class TornAPIService {
  /**
   * Create TornAPIService instance
   * @constructor
   */
  constructor() {
    /** @type {string} Base URL for Torn API */
    this.baseURL = 'https://api.torn.com';
    
    /** @type {number} Rate limit delay in milliseconds */
    this.rateLimitDelay = parseInt(process.env.TORN_API_RATE_LIMIT) || 1000;
    
    /** @type {number} API timeout in milliseconds */
    this.timeout = parseInt(process.env.TORN_API_TIMEOUT) || 10000;
    
    /** @type {number} Timestamp of last API request */
    this.lastRequestTime = 0;
    
    console.log(`Torn API Service initialized with ${this.rateLimitDelay}ms rate limit`);
  }

  /**
   * Make rate-limited request to Torn API
   * @async
   * @function makeRequest
   * @param {string} url - Full API URL to request
   * @returns {Promise<Object>} API response data
   * @throws {Error} If request fails
   */
  async makeRequest(url) {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();

    try {
      console.log(`Making Torn API request: ${url}`);
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'TrainingCompanyApp/1.0',
          'Accept': 'application/json'
        }
      });

      // Check for Torn API errors
      if (response.data.error) {
        const error = response.data.error;
        throw new Error(`Torn API Error ${error.code}: ${error.error}`);
      }

      console.log('Torn API request successful');
      return response.data;
      
    } catch (error) {
      if (error.response) {
        console.error(`Torn API HTTP Error: ${error.response.status} ${error.response.statusText}`);
        throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        console.error('Torn API timeout or network error');
        throw new Error('API request timeout or network error');
      } else {
        console.error('Torn API request error:', error.message);
        throw error;
      }
    }
  }

  /**
   * Verify API key and get basic user info
   * @async
   * @function verifyAPIKey
   * @param {string} apiKey - Torn API key to verify
   * @returns {Promise<Object>} User profile data
   * @throws {Error} If API key is invalid
   */
  async verifyAPIKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length !== 16) {
      throw new Error('Invalid API key format - must be 16 characters');
    }
    
    const url = `${this.baseURL}/user/?selections=profile&key=${apiKey}`;
    const data = await this.makeRequest(url);
    
    return {
      player_id: data.player_id,
      name: data.name,
      level: data.level,
      status: data.status,
      last_action: data.last_action
    };
  }

  /**
   * Get user's work stats
   * @async
   * @function getUserWorkStats
   * @param {string} apiKey - Torn API key
   * @returns {Promise<Object>} Work stats data
   * @throws {Error} If request fails
   */
  async getUserWorkStats(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length !== 16) {
      throw new Error('Invalid API key format - must be 16 characters');
    }
    
    const url = `${this.baseURL}/user/?selections=workstats&key=${apiKey}`;
    const data = await this.makeRequest(url);
    
    return {
      manual_labor: data.manual_labor || 0,
      intelligence: data.intelligence || 0,
      endurance: data.endurance || 0
    };
  }

  /**
   * Get basic user information
   * @async
   * @function getUserBasicInfo
   * @param {string} apiKey - Torn API key
   * @returns {Promise<Object>} Basic user data
   * @throws {Error} If request fails
   */
  async getUserBasicInfo(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length !== 16) {
      throw new Error('Invalid API key format - must be 16 characters');
    }
    
    const url = `${this.baseURL}/user/?selections=basic&key=${apiKey}`;
    const data = await this.makeRequest(url);
    
    return {
      player_id: data.player_id,
      name: data.name,
      level: data.level,
      gender: data.gender,
      status: data.status
    };
  }

  /**
   * Test API service connectivity
   * @async
   * @function testConnection
   * @returns {Promise<boolean>} True if service is working
   */
  async testConnection() {
    try {
      // Test with a minimal request (this will fail due to no API key, but tests connectivity)
      const url = `${this.baseURL}/user/?selections=basic&key=invalid`;
      await this.makeRequest(url);
      return false; // Should not reach here
    } catch (error) {
      // We expect an "Incorrect key" error, which means the API is reachable
      if (error.message.includes('Incorrect key') || error.message.includes('API Error 2')) {
        console.log('Torn API service test: PASSED (API reachable)');
        return true;
      }
      console.error('Torn API service test: FAILED -', error.message);
      return false;
    }
  }
}

/**
 * Singleton instance of TornAPIService
 * @type {TornAPIService}
 */
const tornAPIService = new TornAPIService();

module.exports = tornAPIService;
