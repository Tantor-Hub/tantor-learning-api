// Test Stripe Integration
// Run this with: node test-stripe-integration.js

const Stripe = require('stripe');

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  // Check environment variables
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

  console.log('📋 Environment Variables:');
  console.log(
    `STRIPE_SECRET_KEY: ${stripeSecretKey ? '✅ Set' : '❌ Missing'}`,
  );
  console.log(
    `STRIPE_PUBLIC_KEY: ${stripePublicKey ? '✅ Set' : '❌ Missing'}\n`,
  );

  if (!stripeSecretKey) {
    console.log('❌ STRIPE_SECRET_KEY is not set in environment variables');
    console.log('Please add it to your .env file:');
    console.log('STRIPE_SECRET_KEY=sk_test_your_key_here\n');
    return;
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });

    console.log('🔗 Testing Stripe Connection...');

    // Test creating a payment intent (simulating the backend logic)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // 20.00 EUR in cents (simulating training.prix * 100)
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });

    console.log('✅ Stripe Connection Successful!');
    console.log(`Payment Intent ID: ${paymentIntent.id}`);
    console.log(
      `Client Secret: ${paymentIntent.client_secret ? '✅ Generated' : '❌ Missing'}`,
    );
    console.log(`Status: ${paymentIntent.status}`);

    // Test retrieving the payment intent
    const retrievedIntent = await stripe.paymentIntents.retrieve(
      paymentIntent.id,
    );
    console.log(`Retrieved Status: ${retrievedIntent.status}`);

    console.log('\n🎉 Stripe Integration Test Passed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start your server: npm run start:dev');
    console.log('2. Check Swagger: http://localhost:3737/api');
    console.log('3. Test the /paymentmethodcard/payment-intent endpoint');
  } catch (error) {
    console.log('❌ Stripe Integration Test Failed!');
    console.log('Error:', error.message);

    if (error.type === 'StripeAuthenticationError') {
      console.log('\n🔑 Authentication Error:');
      console.log('- Check your STRIPE_SECRET_KEY');
      console.log('- Make sure it starts with sk_test_ or sk_live_');
    }
  }
}

// Run the test
testStripeIntegration();
