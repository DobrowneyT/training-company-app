/**
 * Debug Routes for Network Testing
 * Add these routes to test connectivity from Railway
 * 
 * @file backend/src/routes/debug.js (or add to existing routes)
 */

const express = require('express');
const tornAPI = require('../services/tornAPI');
const axios = require('axios');

const router = express.Router();

/**
 * Test connectivity to Torn API from Railway
 */
router.get('/test-connectivity', async (req, res) => {
  try {
    console.log('🔍 Starting connectivity test from Railway...');
    
    const testResult = await tornAPI.testConnectivity();
    const stats = tornAPI.getStats();
    
    const response = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      platform: 'Railway',
      connectivity: testResult,
      apiStats: stats,
      networkInfo: {
        hostname: require('os').hostname(),
        platform: require('os').platform(),
        nodeVersion: process.version
      }
    };
    
    console.log('🔍 Connectivity test results:', JSON.stringify(response, null, 2));
    
    res.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('❌ Connectivity test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test basic HTTP connectivity
 */
router.get('/test-http', async (req, res) => {
  const tests = [
    { name: 'Google DNS', url: 'https://8.8.8.8' },
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Torn Main Site', url: 'https://www.torn.com' },
    { name: 'Torn API Base', url: 'https://api.torn.com/v2' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing connectivity to ${test.name}...`);
      const start = Date.now();
      
      const response = await axios.get(test.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'TrainingCompanyApp/2.0 (Railway Network Test)'
        }
      });
      
      const duration = Date.now() - start;
      
      results.push({
        name: test.name,
        url: test.url,
        success: true,
        status: response.status,
        duration: duration,
        headers: {
          'content-type': response.headers['content-type'],
          'server': response.headers['server']
        }
      });
      
      console.log(`✅ ${test.name}: ${response.status} (${duration}ms)`);
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.code} - ${error.message}`);
      
      results.push({
        name: test.name,
        url: test.url,
        success: false,
        error: error.code || 'UNKNOWN',
        message: error.message,
        duration: null
      });
    }
  }
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    tests: results,
    summary: {
      total: tests.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  });
});

/**
 * Test with a real API key (for debugging)
 */
router.post('/test-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key required for testing'
      });
    }
    
    console.log('🔍 Testing API key verification from Railway...');
    
    const result = await tornAPI.verifyAPIKey(apiKey);
    const stats = tornAPI.getStats();
    
    res.json({
      success: true,
      message: 'API key verification successful',
      userData: {
        player_id: result.player_id,
        name: result.name
      },
      apiStats: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API key test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;