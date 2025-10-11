// Test Automatic Payment Method Card Creation
// Run this with: node test-automatic-creation.js

const fetch = require('node-fetch');

async function testAutomaticCreation() {
  console.log('🧪 Testing Automatic Payment Method Card Creation...\n');

  const baseUrl = 'https://staffing-alerts-sought-hayes.trycloudflare.com/api';

  // Test data - replace with actual values
  const testData = {
    sessionId: '550e8400-e29b-41d4-a716-446655440000', // Replace with actual session ID
    userId: 'user-id-here', // Replace with actual user ID
    stripePaymentIntentId: 'pi_test_1234567890abcdef', // Replace with actual payment intent ID
  };

  console.log('📋 Test Data:');
  console.log(JSON.stringify(testData, null, 2));

  try {
    // Test 1: Direct call to createPaymentMethodCardAfterPayment
    console.log(
      '\n🔧 Test 1: Direct call to createPaymentMethodCardAfterPayment...',
    );

    const response = await fetch(
      `${baseUrl}/paymentmethodcard/payment-success`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer YOUR_JWT_TOKEN_HERE', // Replace with actual JWT token
        },
        body: JSON.stringify({
          sessionId: testData.sessionId,
          stripePaymentIntentId: testData.stripePaymentIntentId,
        }),
      },
    );

    console.log('📊 Response Status:', response.status);
    const responseData = await response.json();
    console.log('📋 Response Data:');
    console.log(JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log(
        '✅ Test 1 Passed: Payment method card created successfully!',
      );
    } else {
      console.log('❌ Test 1 Failed:', responseData.message);
    }
  } catch (error) {
    console.log('❌ Test 1 Error:', error.message);
  }

  try {
    // Test 2: Check if we can create a payment intent first
    console.log('\n🔧 Test 2: Creating payment intent...');

    const paymentIntentResponse = await fetch(
      `${baseUrl}/paymentmethodcard/payment-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer YOUR_JWT_TOKEN_HERE', // Replace with actual JWT token
        },
        body: JSON.stringify({
          id_session: testData.sessionId,
        }),
      },
    );

    console.log(
      '📊 Payment Intent Response Status:',
      paymentIntentResponse.status,
    );
    const paymentIntentData = await paymentIntentResponse.json();
    console.log('📋 Payment Intent Response Data:');
    console.log(JSON.stringify(paymentIntentData, null, 2));

    if (
      paymentIntentResponse.ok &&
      paymentIntentData.data &&
      paymentIntentData.data.clientSecret
    ) {
      console.log('✅ Test 2 Passed: Payment intent created successfully!');
      console.log('🔑 Client Secret:', paymentIntentData.data.clientSecret);

      // Extract payment intent ID from client secret
      const paymentIntentId =
        paymentIntentData.data.clientSecret.split('_secret_')[0];
      console.log('🆔 Payment Intent ID:', paymentIntentId);

      // Test 3: Check payment intent status (this should trigger automatic creation)
      console.log('\n🔧 Test 3: Checking payment intent status...');

      const statusResponse = await fetch(
        `${baseUrl}/paymentmethodcard/payment-intent/${paymentIntentId}`,
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer YOUR_JWT_TOKEN_HERE', // Replace with actual JWT token
          },
        },
      );

      console.log('📊 Status Response Status:', statusResponse.status);
      const statusData = await statusResponse.json();
      console.log('📋 Status Response Data:');
      console.log(JSON.stringify(statusData, null, 2));

      if (statusResponse.ok) {
        console.log('✅ Test 3 Passed: Status check completed!');
        console.log('📊 Payment Status:', statusData.data?.status);
      } else {
        console.log('❌ Test 3 Failed:', statusData.message);
      }
    } else {
      console.log('❌ Test 2 Failed: Could not create payment intent');
    }
  } catch (error) {
    console.log('❌ Test 2/3 Error:', error.message);
  }

  console.log('\n📝 Instructions:');
  console.log('1. Replace YOUR_JWT_TOKEN_HERE with a valid JWT token');
  console.log('2. Replace session ID with an actual training session ID');
  console.log('3. Make sure the user has student role');
  console.log('4. Check server logs for detailed information');
}

// Run the test
testAutomaticCreation();
