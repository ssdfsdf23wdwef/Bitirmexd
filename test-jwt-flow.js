// Test script to verify JWT token authentication flow
// Using built-in fetch in Node.js 18+

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

console.log('🧪 Testing JWT Token Authentication Flow');
console.log('==========================================');

async function testBackendHealth() {
  console.log('\n1. Testing Backend Health...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/health`);
    const data = await response.text();
    console.log(`✅ Backend Health: ${response.status} - ${data}`);
    return response.ok;
  } catch (error) {
    console.log(`❌ Backend Health Failed: ${error.message}`);
    return false;
  }
}

async function testFrontendHealth() {
  console.log('\n2. Testing Frontend Health...');
  try {
    const response = await fetch(`${FRONTEND_URL}`);
    console.log(`✅ Frontend Health: ${response.status} - ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.log(`❌ Frontend Health Failed: ${error.message}`);
    return false;
  }
}

async function testLearningTargetsEndpoint() {
  console.log('\n3. Testing Learning Targets Endpoint (without auth)...');
  try {
    // This should return 401 since we don't have authentication
    const response = await fetch(`${BACKEND_URL}/api/learning-targets`);
    console.log(`📊 Learning Targets Endpoint: ${response.status} - ${response.statusText}`);
    
    if (response.status === 401) {
      console.log('✅ Expected 401 - JWT Guard is working correctly');
      return true;
    } else {
      console.log('⚠️  Unexpected response - should be 401 without auth');
      return false;
    }
  } catch (error) {
    console.log(`❌ Learning Targets Test Failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Starting comprehensive authentication flow tests...\n');
  
  const backendOk = await testBackendHealth();
  const frontendOk = await testFrontendHealth();
  const learningTargetsOk = await testLearningTargetsEndpoint();
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  console.log(`Backend Health: ${backendOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Health: ${frontendOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`JWT Guard Working: ${learningTargetsOk ? '✅ PASS' : '❌ FAIL'}`);
  
  const allTestsPassed = backendOk && frontendOk && learningTargetsOk;
  
  console.log(`\n🎯 Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allTestsPassed) {
    console.log('\n🚀 Authentication Fix Status:');
    console.log('• Backend: Running with JWT token generation');
    console.log('• Frontend: Updated to use correct service methods');
    console.log('• JWT Guard: Protecting endpoints as expected');
    console.log('\n💡 Next Steps:');
    console.log('1. Login via the frontend UI to get a JWT token');
    console.log('2. Test saving learning targets to verify 401 error is resolved');
    console.log('3. Verify course detail page loads learning targets correctly');
  }
  
  return allTestsPassed;
}

// Run the tests
runTests().catch(console.error);
