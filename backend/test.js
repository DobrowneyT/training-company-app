/**
 * Test script for admin API endpoints
 * Run with: node test-admin-endpoints.js
 */

const axios = require('axios');
const { prisma } = require('./src/services/database');

const API_BASE = 'http://localhost:3001/api/admin';
let authToken = null;

async function loginAsAdmin() {
  console.log('🔐 Logging in as MonChoon admin...');
  
  try {
    const response = await axios.post(`${API_BASE}/login`, {
      username: 'MonChoon',
      password: '!@$$1122'
    });
    
    authToken = response.data.data.token;
    console.log('✅ Login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testEndpoint(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method.toUpperCase()} ${endpoint} failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function runAdminEndpointTests() {
  console.log('🧪 Testing Admin API Endpoints...\n');
  
  try {
    // Login first
    await loginAsAdmin();
    
    // Test 1: Get all companies
    console.log('📊 Testing GET /companies...');
    const companiesResponse = await testEndpoint('GET', '/companies');
    console.log(`✅ Found ${companiesResponse.data.companies.length} companies`);
    
    const testCompany = companiesResponse.data.companies[0];
    if (testCompany) {
      console.log(`   Company: ${testCompany.name} (${testCompany.employeeCount} employees)`);
    }
    
    // Test 2: Get company details
    if (testCompany) {
      console.log('\n🔍 Testing GET /companies/:id/details...');
      const detailsResponse = await testEndpoint('GET', `/companies/${testCompany.id}/details`);
      console.log(`✅ Company details: ${detailsResponse.data.name}`);
      console.log(`   Bank: $${detailsResponse.data.companyBank}`);
      console.log(`   Employees: ${detailsResponse.data.employees.length}`);
    }
    
    // Test 3: Update company settings
    if (testCompany) {
      console.log('\n⚙️ Testing PUT /companies/:id (update settings)...');
      const updateResponse = await testEndpoint('PUT', `/companies/${testCompany.id}`, {
        hasTCP: true,
        hasTGP: true,
        advertising: 'Updated from test script'
      });
      console.log('✅ Company settings updated');
    }
    
    // Test 4: Add purchase record
    if (testCompany) {
      console.log('\n💰 Testing POST /companies/:id/purchases...');
      const purchaseResponse = await testEndpoint('POST', `/companies/${testCompany.id}/purchases`, {
        trainsPurchased: 75,
        notes: 'Test purchase from API test script'
      });
      console.log(`✅ Purchase added: ${purchaseResponse.data.trainsPurchased} trains`);
    }
    
    // Test 5: Get purchase history
    if (testCompany) {
      console.log('\n📋 Testing GET /companies/:id/purchases...');
      const historyResponse = await testEndpoint('GET', `/companies/${testCompany.id}/purchases`);
      console.log(`✅ Purchase history: ${historyResponse.data.purchases.length} records`);
      console.log(`   Total trains purchased: ${historyResponse.data.summary.totalTrainsPurchased}`);
    }
    
    // Test 6: Get training requests
    console.log('\n📥 Testing GET /training-requests...');
    const requestsResponse = await testEndpoint('GET', '/training-requests');
    console.log(`✅ Training requests: ${requestsResponse.data.requests.length} pending`);
    
    // Test 7: Get analytics overview
    console.log('\n📈 Testing GET /analytics/overview...');
    const analyticsResponse = await testEndpoint('GET', '/analytics/overview');
    const overview = analyticsResponse.data.overview;
    console.log('✅ Analytics overview:');
    console.log(`   Companies: ${overview.totalCompanies}`);
    console.log(`   Employees: ${overview.totalEmployees}`);
    console.log(`   Trains Purchased: ${overview.totalTrainsPurchased}`);
    console.log(`   Pending Requests: ${overview.pendingRequests}`);
    
    console.log('\n🎉 All admin endpoint tests passed!');
    
  } catch (error) {
    console.error('❌ Admin endpoint tests failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Start the backend server first, then run tests
console.log('🚀 Make sure the backend server is running on http://localhost:3001');
console.log('   Run: npm run dev\n');

setTimeout(runAdminEndpointTests, 1000);