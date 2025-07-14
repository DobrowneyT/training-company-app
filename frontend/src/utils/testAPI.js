import apiService from '../services/api';

export async function testAPIConnection() {
  console.log('🧪 Testing API connection...');
  
  try {
    const isHealthy = await apiService.testConnection();
    
    if (isHealthy) {
      console.log('✅ API health check passed');
    } else {
      console.error('❌ API health check failed');
      return false;
    }

    console.log('🎉 API connection tests completed successfully');
    return true;

  } catch (error) {
    console.error('❌ API connection test failed:', error);
    console.error('📝 Make sure backend is running on localhost:3001');
    return false;
  }
}

if (import.meta.env.DEV) {
  setTimeout(testAPIConnection, 1000);
}
