# 🚀 Frontend Stripe Integration Guide

## **Complete Frontend Implementation for Card Payments**

This guide shows how to integrate the Stripe payment system in your frontend application.

---

## 📋 **Prerequisites**

1. **Stripe Account**: Get your test keys from [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Environment Variables**: Add to your frontend `.env`:
   ```bash
   REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
   REACT_APP_API_BASE_URL=http://localhost:3737/api
   ```

---

## 🔧 **Installation**

### **React/Next.js**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **Vue.js**

```bash
npm install @stripe/stripe-js
```

---

## 💳 **Complete React Implementation**

### **1. Stripe Provider Setup**

```jsx
// App.js or App.tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
```

### **2. Payment Form Component**

```jsx
// PaymentForm.jsx
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CardElement as StripeCardElement } from '@stripe/react-stripe-js';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createPaymentMethodCard = async (stripePaymentIntentId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/paymentmethodcard/payment-success`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: '550e8400-e29b-41d4-a716-446655440000', // Your session ID
            stripePaymentIntentId: stripePaymentIntentId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to create payment method card');
      }

      const result = await response.json();
      console.log('✅ Payment method card created:', result);
    } catch (error) {
      console.error('❌ Error creating payment method card:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Payment Intent
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/paymentmethodcard/payment-intent`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_session: '550e8400-e29b-41d4-a716-446655440000', // Training session ID
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);

      const { clientSecret } = responseData.data;

      // 2. Confirm Payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: 'Customer Name', // Get from form
            },
          },
        },
      );

      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        console.log('✅ Payment successful!');

        // Payment method card and user session are created automatically!
        // No need to call additional endpoints - the backend handles everything

        // Redirect to success page or show success message
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label>Card Details</label>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Payment successful! 🎉</div>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="pay-button"
      >
        {loading ? 'Processing...' : `Pay €150.00`}
      </button>
    </form>
  );
}
```

---

## 🎯 **Vue.js Implementation**

### **1. Payment Component**

```vue
<!-- PaymentForm.vue -->
<template>
  <div class="payment-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Card Details</label>
        <div id="card-element" ref="cardElement"></div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">Payment successful! 🎉</div>

      <button type="submit" :disabled="loading || !stripe" class="pay-button">
        {{ loading ? 'Processing...' : 'Pay €150.00' }}
      </button>
    </form>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';

export default {
  name: 'PaymentForm',
  data() {
    return {
      stripe: null,
      cardElement: null,
      loading: false,
      error: null,
      success: false,
    };
  },
  async mounted() {
    // Initialize Stripe
    this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY);

    // Create card element
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
        },
      },
    });

    this.cardElement.mount(this.$refs.cardElement);
  },
  methods: {
    async createPaymentMethodCard(stripePaymentIntentId) {
      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_BASE_URL}/paymentmethodcard/payment-success`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: '550e8400-e29b-41d4-a716-446655440000', // Your session ID
              stripePaymentIntentId: stripePaymentIntentId,
            }),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to create payment method card');
        }

        const result = await response.json();
        console.log('✅ Payment method card created:', result);
      } catch (error) {
        console.error('❌ Error creating payment method card:', error);
      }
    },

    async handleSubmit() {
      if (!this.stripe || !this.cardElement) return;

      this.loading = true;
      this.error = null;

      try {
        // 1. Create Payment Intent
        const response = await fetch(
          `${process.env.VUE_APP_API_BASE_URL}/paymentmethodcard/payment-intent`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_session: '550e8400-e29b-41d4-a716-446655440000', // Training session ID
            }),
          },
        );

        const responseData = await response.json();
        console.log('Response data:', responseData);

        const { clientSecret } = responseData.data;

        // 2. Confirm Payment
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                name: 'Customer Name',
              },
            },
          },
        );

        if (error) {
          this.error = error.message;
        } else if (paymentIntent.status === 'succeeded') {
          this.success = true;
          console.log('✅ Payment successful!');

          // Payment method card and user session are created automatically!
          // No need to call additional endpoints - the backend handles everything
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
```

---

## 🔍 **Payment Status Checking**

### **Check Payment Status After Processing**

```javascript
// Check payment status
async function checkPaymentStatus(paymentIntentId) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/paymentmethodcard/payment-intent/${paymentIntentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      },
    );

    const responseData = await response.json();
    const { status } = responseData.data;

    switch (status) {
      case 'succeeded':
        console.log('✅ Payment successful!');
        // Redirect to success page
        break;
      case 'requires_action':
        console.log('⚠️ Additional authentication required');
        // Handle 3D Secure
        break;
      case 'canceled':
        console.log('❌ Payment was canceled');
        // Show error message
        break;
      default:
        console.log('⏳ Payment still processing...');
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
}
```

---

## 🎨 **CSS Styling**

```css
/* PaymentForm.css */
.payment-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.pay-button {
  width: 100%;
  padding: 12px 24px;
  background: #635bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.pay-button:hover:not(:disabled) {
  background: #5a52e8;
}

.pay-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  background: #fdf2f2;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #fecaca;
}

.success {
  color: #059669;
  background: #f0fdf4;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #bbf7d0;
}
```

---

## 🧪 **Testing**

### **Test Card Numbers**

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### **Test Flow**

1. Use test card number: `4242 4242 4242 4242`
2. Use any future expiry date: `12/25`
3. Use any 3-digit CVC: `123`
4. Use any ZIP code: `12345`

---

## 🚨 **Error Handling**

### **Common Errors & Solutions**

| Error                | Solution                         |
| -------------------- | -------------------------------- |
| `Invalid API Key`    | Check your Stripe public key     |
| `Payment failed`     | Check card details and try again |
| `3D Secure required` | Complete authentication popup    |
| `Insufficient funds` | Use a different test card        |

---

## 📱 **Mobile Optimization**

```css
/* Mobile-friendly styles */
@media (max-width: 768px) {
  .payment-form {
    padding: 16px;
  }

  .pay-button {
    padding: 16px 24px;
    font-size: 18px;
  }
}
```

---

## 🔒 **Security Best Practices**

1. **Never store card details** on your server
2. **Always use HTTPS** in production
3. **Validate amounts** on the backend
4. **Use test keys** during development
5. **Implement proper error handling**

---

## 🎉 **You're Ready!**

Your frontend is now ready to process payments securely through Stripe!

**Next Steps:**

1. Test with the provided test cards
2. Customize the styling to match your app
3. Add proper error handling and loading states
4. Deploy with your production Stripe keys
