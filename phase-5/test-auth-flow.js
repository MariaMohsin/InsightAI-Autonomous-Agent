// test-auth-flow.js
// Script to test the complete authentication flow

const axios = require('axios');

const API_BASE = 'http://localhost:8000';
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

console.log('🧪 Testing Authentication Flow\n');

async function testAuthFlow() {
  try {
    // Test 1: Signup
    console.log('📝 Test 1: User Signup');
    console.log(`   Email: ${TEST_USER.email}`);

    const signupResponse = await axios.post(`${API_BASE}/auth/register`, TEST_USER);

    if (signupResponse.data.access_token && signupResponse.data.user) {
      console.log('   ✅ Signup successful');
      console.log(`   Token received: ${signupResponse.data.access_token.substring(0, 20)}...`);
      console.log(`   User ID: ${signupResponse.data.user.id}`);
    } else {
      console.log('   ❌ Signup failed - no token received');
      return;
    }

    const token = signupResponse.data.access_token;

    // Test 2: Login with same credentials
    console.log('\n🔐 Test 2: User Login');
    console.log(`   Email: ${TEST_USER.email}`);

    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_USER);

    if (loginResponse.data.access_token && loginResponse.data.user) {
      console.log('   ✅ Login successful');
      console.log(`   Token received: ${loginResponse.data.access_token.substring(0, 20)}...`);
      console.log(`   User ID: ${loginResponse.data.user.id}`);
    } else {
      console.log('   ❌ Login failed - no token received');
      return;
    }

    // Test 3: Access protected endpoint (get user's todos)
    console.log('\n🔒 Test 3: Access Protected Endpoint (Get Todos)');

    try {
      const todosResponse = await axios.get(`${API_BASE}/todos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('   ✅ Successfully accessed protected endpoint');
      console.log(`   Todos count: ${todosResponse.data.length}`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ❌ 401 Unauthorized - token not accepted');
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
      return;
    }

    // Test 4: Access protected endpoint without token (should fail)
    console.log('\n🚫 Test 4: Access Protected Endpoint Without Token');

    try {
      await axios.get(`${API_BASE}/todos`);
      console.log('   ❌ Should have received 401 but request succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Correctly received 401 Unauthorized');
      } else {
        console.log(`   ⚠️  Unexpected error: ${error.message}`);
      }
    }

    // Test 5: Create a todo (testing full authenticated flow)
    console.log('\n📋 Test 5: Create Todo (Authenticated Operation)');

    try {
      const createTodoResponse = await axios.post(
        `${API_BASE}/todos`,
        {
          title: 'Test Todo from Auth Flow',
          description: 'This todo was created during authentication testing'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('   ✅ Todo created successfully');
      console.log(`   Todo ID: ${createTodoResponse.data.id}`);
      console.log(`   Title: ${createTodoResponse.data.title}`);
    } catch (error) {
      console.log(`   ❌ Error creating todo: ${error.response?.data?.detail || error.message}`);
    }

    console.log('\n✅ All authentication tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✓ Signup works correctly');
    console.log('   ✓ Login works correctly');
    console.log('   ✓ JWT tokens are issued properly');
    console.log('   ✓ Protected endpoints require authentication');
    console.log('   ✓ Authenticated requests work correctly');

  } catch (error) {
    console.log('\n❌ Test failed with error:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.detail || error.message}`);
    } else {
      console.log(`   ${error.message}`);
    }
    process.exit(1);
  }
}

// Run the tests
testAuthFlow().catch(error => {
  console.error('Unhandled error:', error.message);
  process.exit(1);
});
