/**
 * Test script to verify MongoDB backend connectivity
 * Run this to check if the backend at localhost:4000 is working
 */

import { checkBackendHealth, getBackendInfo } from './lib/api/health'

async function testBackendConnection() {
  console.log('🔍 Testing MongoDB backend connection...\n')

  // Test health endpoint
  console.log('📊 Checking backend health...')
  const healthResult = await checkBackendHealth()
  
  if (healthResult.success) {
    console.log('✅ Backend Health Check: SUCCESS')
    console.log('📈 Status:', healthResult.data?.status)
    console.log('💾 MongoDB:', healthResult.data?.mongodb)
    console.log('📅 Timestamp:', healthResult.data?.timestamp)
  } else {
    console.log('❌ Backend Health Check: FAILED')
    console.log('📝 Error:', healthResult.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test info endpoint
  console.log('📋 Getting backend info...')
  const infoResult = await getBackendInfo()
  
  if (infoResult.success) {
    console.log('✅ Backend Info: SUCCESS')
    console.log('📊 Data:', JSON.stringify(infoResult.data, null, 2))
  } else {
    console.log('❌ Backend Info: FAILED')
    console.log('📝 Error:', infoResult.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Summary
  if (healthResult.success && infoResult.success) {
    console.log('🎉 Backend connection test: ALL TESTS PASSED!')
    console.log('🚀 Your MongoDB backend is ready for use')
  } else {
    console.log('⚠️  Backend connection test: SOME TESTS FAILED')
    console.log('🔧 Please check:')
    console.log('   - Backend server is running on localhost:4000')
    console.log('   - MongoDB is connected')
    console.log('   - No firewall blocking the connection')
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBackendConnection().catch(console.error)
}

export { testBackendConnection }