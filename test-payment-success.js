// Test Payment Success Endpoint
// Run this with: node test-payment-success.js

const fetch = require('node-fetch');

async function testPaymentSuccess() {
  console.log('🧪 Testing Payment Success Endpoint...\n');

  const baseUrl = 'https://staffing-alerts-sought-hayes.trycloudflare.com/api';
  const testData = {
    sessionId: '550e8400-e29b-41d4-a716-446655440000', // Replace with actual session ID
    stripePaymentIntentId: 'pi_test_1234567890abcdef', // Replace with actual payment intent ID
  };

  console.log('📋 Test Data:');
  console.log(JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(
      `${baseUrl}/paymentmethodcard/payment-success`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: You'll need to add a valid JWT token here for testing
          // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
        },
        body: JSON.stringify(testData),
      },
    );

    console.log('\n📊 Response Status:', response.status);
    console.log(
      '📊 Response Headers:',
      Object.fromEntries(response.headers.entries()),
    );

    const responseData = await response.json();
    console.log('\n📋 Response Data:');
    console.log(JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ Payment Success Endpoint Test Passed!');
    } else {
      console.log('\n❌ Payment Success Endpoint Test Failed!');
    }
  } catch (error) {
    console.log('\n❌ Error testing payment success endpoint:');
    console.log(error.message);
  }
}

// Run the test
testPaymentSuccess();
