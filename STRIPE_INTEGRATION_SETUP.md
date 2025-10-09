# Stripe Integration Setup Guide

This guide explains how to set up Stripe payment integration for the PaymentMethodCard module using Payment Intents.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
```

### Environment Variables Explanation

- **STRIPE_SECRET_KEY**: Your Stripe secret key (starts with `sk_test_` for test mode, `sk_live_` for live mode)
- **STRIPE_PUBLIC_KEY**: Your Stripe publishable key (starts with `pk_test_` for test mode, `pk_live_` for live mode)

## API Endpoints

### 1. Create Stripe Payment Intent

**POST** `/paymentmethodcard/payment-intent`

Creates a Stripe Payment Intent and returns the client secret. The frontend uses this to process payments directly.

**Request Body:**

```json
{
  "amount": 15000
}
```

**Response:**

```json
{
  "clientSecret": "pi_1234567890abcdef_secret_xyz"
}
```

### 2. Get Payment Intent Status

**GET** `/paymentmethodcard/payment-intent/:id`

Retrieves the payment status of a Stripe Payment Intent.

**Response:**

```json
{
  "status": "succeeded"
}
```

## Frontend Integration Examples

### React/Next.js Example

```typescript
// Create payment intent
const createPaymentIntent = async (amount: number) => {
  try {
    const response = await fetch('/api/paymentmethodcard/payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount, // Amount in cents
      }),
    });

    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Check payment intent status
const checkPaymentIntentStatus = async (paymentIntentId: string) => {
  try {
    const response = await fetch(
      `/api/paymentmethodcard/payment-intent/${paymentIntentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return data.status; // 'requires_payment_method', 'succeeded', etc.
  } catch (error) {
    console.error('Error checking payment intent status:', error);
  }
};
```

### Complete Payment Flow

```typescript
import { loadStripe } from '@stripe/stripe-js';

const handlePayment = async () => {
  try {
    // 1. Create payment intent
    const amount = 15000; // 150.00 EUR in cents
    const clientSecret = await createPaymentIntent(amount);

    // 2. Initialize Stripe
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    );

    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    // 3. Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement, // Your card element
          billing_details: {
            name: 'Customer Name',
            email: 'customer@example.com',
          },
        },
      },
    );

    if (error) {
      console.error('Payment failed:', error);
      // Handle payment error
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded:', paymentIntent.id);
      // Handle successful payment
      window.location.href = '/payment-success';
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

### Advanced Frontend Implementation

Here's a more complete example with session ID handling:

```typescript
// Store session ID before redirecting to Stripe
const handlePayment = async () => {
  try {
    const response = await fetch('/api/paymentmethodcard/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [{ name: 'Training Session', price: 150.0, quantity: 1 }],
        email: 'student@example.com',
      }),
    });

    const data = await response.json();

    if (data.url) {
      // Extract session ID from the URL
      const sessionId = data.url.split('/').pop()?.split('?')[0];

      // Store session ID for later verification
      localStorage.setItem('stripe_session_id', sessionId);

      // Redirect to Stripe
      window.location.href = data.url;
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};

// Check payment status when user returns
const checkPaymentStatus = async () => {
  const sessionId = localStorage.getItem('stripe_session_id');

  if (sessionId) {
    try {
      const response = await fetch(
        `/api/paymentmethodcard/session/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      if (data.status === 'paid') {
        // Payment successful
        localStorage.removeItem('stripe_session_id');
        showSuccessMessage();
        redirectToSuccessPage();
      } else {
        // Payment failed
        showErrorMessage();
        redirectToErrorPage();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }
};

// Call this when the page loads (e.g., in useEffect)
useEffect(() => {
  checkPaymentStatus();
}, []);
```

## Testing

### Test Cards

Use these test card numbers for testing:

- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`

### Test Flow

1. Set up environment variables with test keys
2. Create a payment intent using the API
3. Use test card numbers with Stripe.js
4. Verify payment status using the payment intent endpoint

## Security Notes

- Never expose your secret key in frontend code
- Always validate payments on the backend
- Use HTTPS in production
- Implement proper error handling
- Log payment events for audit trails

## Error Handling

The integration includes comprehensive error handling:

- **400**: Invalid request data or session ID
- **401**: Unauthorized (missing or invalid JWT token)
- **500**: Internal server error or Stripe configuration issues

All errors are logged with detailed information for debugging.
