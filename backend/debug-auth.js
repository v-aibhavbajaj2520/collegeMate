const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!'
};

async function testSignup() {
  console.log('\n🧪 Testing Signup Flow...');
  try {
    const response = await axios.post(`${BASE_URL}/signup`, testUser);
    console.log('✅ Signup Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Signup Error:', error.response?.data || error.message);
    return null;
  }
}

async function testVerifyOTP(email, otp) {
  console.log('\n🧪 Testing OTP Verification...');
  try {
    const response = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
    console.log('✅ OTP Verification Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ OTP Verification Error:', error.response?.data || error.message);
    return null;
  }
}

async function testLogin(email, password) {
  console.log('\n🧪 Testing Login Flow...');
  try {
    const response = await axios.post(`${BASE_URL}/login`, { email, password });
    console.log('✅ Login Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Login Error:', error.response?.data || error.message);
    return null;
  }
}

async function testVerifyLoginOTP(email, otp) {
  console.log('\n🧪 Testing Login OTP Verification...');
  try {
    const response = await axios.post(`${BASE_URL}/verify-login-otp`, { email, otp });
    console.log('✅ Login OTP Verification Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Login OTP Verification Error:', error.response?.data || error.message);
    return null;
  }
}

async function testForgotPassword(email) {
  console.log('\n🧪 Testing Forgot Password...');
  try {
    const response = await axios.post(`${BASE_URL}/forgot-password`, { email });
    console.log('✅ Forgot Password Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Forgot Password Error:', error.response?.data || error.message);
    return null;
  }
}

async function testResendOTP(email) {
  console.log('\n🧪 Testing Resend OTP...');
  try {
    const response = await axios.post(`${BASE_URL}/resend-otp`, { email });
    console.log('✅ Resend OTP Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Resend OTP Error:', error.response?.data || error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Authentication System Debug Tests...\n');
  
  // Test 1: Signup
  const signupResult = await testSignup();
  if (!signupResult?.success) {
    console.log('❌ Signup failed, stopping tests');
    return;
  }
  
  // Wait a moment for email to be sent
  console.log('\n⏳ Waiting 2 seconds for email to be sent...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Resend OTP
  await testResendOTP(testUser.email);
  
  // Wait for resend
  console.log('\n⏳ Waiting 2 seconds for resend email...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Verify OTP (you'll need to enter the actual OTP from console/email)
  console.log('\n⚠️  Please check the server console for the OTP and enter it below:');
  console.log('   Or check your email for the OTP');
  
  // For demo purposes, we'll use a placeholder OTP
  // In real testing, you'd enter the actual OTP
  const otp = '123456'; // Replace with actual OTP
  const verifyResult = await testVerifyOTP(testUser.email, otp);
  
  if (verifyResult?.success) {
    // Test 4: Login
    const loginResult = await testLogin(testUser.email, testUser.password);
    
    if (loginResult?.success && loginResult.requiresOTP) {
      // Test 5: Verify Login OTP
      const loginOtp = '123456'; // Replace with actual OTP
      await testVerifyLoginOTP(testUser.email, loginOtp);
    }
  }
  
  // Test 6: Forgot Password
  await testForgotPassword(testUser.email);
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Check server console for detailed logs');
  console.log('- Check your email for OTP emails');
  console.log('- Check Firestore console for pendingVerifications collection');
  console.log('- Verify 5-minute cleanup is working');
}

// Run tests
runAllTests().catch(console.error);
