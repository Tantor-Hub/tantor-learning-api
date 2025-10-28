# Payment Validation and Error Handling Guide

This guide explains how to check payment intent status and handle payment errors like insufficient funds, expired cards, and refused transactions in the Tantor Learning API.

## 🚨 Enhanced Payment Error Handling

The system now provides comprehensive error handling for card payments with detailed error categorization and user-friendly French messages.

### Supported Error Types

- **Insufficient Funds** (`insufficient_funds`)
- **Expired Cards** (`expired_card`)
- **Refused Transactions** (`card_declined`)
- **3D Secure Authentication** (`authentication_required`)
- **Processing Errors** (`processing_error`)
- **Invalid Card Data** (`incorrect_cvc`, `incorrect_number`, etc.)

## 🔧 API Endpoints

### 1. Enhanced Payment Status Check

**GET** `/api/paymentmethodcard/payment-intent/:id`

Returns detailed payment status with error information.

**Response Format:**

```json
{
  "status": "succeeded|requires_action|requires_payment_method|error",
  "errorCode": "insufficient_funds|expired_card|card_declined|etc",
  "errorMessage": "User-friendly French error message",
  "errorDetails": {
    "type": "card_error",
    "code": "insufficient_funds",
    "message": "Your card has insufficient funds.",
    "decline_code": "insufficient_funds"
  },
  "requiresAction": false,
  "nextAction": {
    "type": "use_stripe_sdk",
    "redirectToUrl": "https://..."
  }
}
```

### 2. Comprehensive Payment Validation

**GET** `/api/paymentmethodcard/payment-validation/:id`

Enhanced endpoint specifically for comprehensive payment validation with detailed error information.

## 🎯 Frontend Integration

### Basic Payment Status Check

```javascript
// Check payment status with error handling
const checkPaymentStatus = async (paymentIntentId) => {
  try {
    const response = await fetch(
      `/api/paymentmethodcard/payment-intent/${paymentIntentId}`,
      {
        headers: {
          Authorization: 'Bearer YOUR_JWT_TOKEN',
        },
      },
    );

    const data = await response.json();

    if (data.status === 'succeeded') {
      console.log('✅ Payment successful!');
      // Handle success - redirect to success page
      window.location.href = '/payment-success';
    } else if (data.requiresAction) {
      console.log('🔄 Additional action required:', data.nextAction);
      // Handle 3D Secure or other actions
      if (data.nextAction.type === 'use_stripe_sdk') {
        // Use Stripe.js to handle 3D Secure
        const { error } = await stripe.confirmCardPayment(clientSecret);
        if (error) {
          showError(error.message);
        }
      }
    } else if (data.errorCode) {
      console.error('❌ Payment failed:', data.errorMessage);
      // Handle specific error types
      handlePaymentError(data);
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    showError('Une erreur est survenue lors de la vérification du paiement.');
  }
};
```

### Comprehensive Error Handling

```javascript
// Handle different payment error types
const handlePaymentError = (paymentData) => {
  const { errorCode, errorMessage } = paymentData;

  switch (errorCode) {
    case 'insufficient_funds':
      showError(
        'Fonds insuffisants. Veuillez vérifier votre solde ou utiliser une autre carte.',
      );
      // Optionally suggest alternative payment methods
      showAlternativePaymentOptions();
      break;

    case 'expired_card':
      showError('Votre carte a expiré. Veuillez utiliser une carte valide.');
      // Clear card form and ask for new card
      clearCardForm();
      break;

    case 'card_declined':
      showError(
        'Votre carte a été refusée. Veuillez contacter votre banque ou utiliser une autre carte.',
      );
      // Suggest contacting bank or trying different card
      showBankContactInfo();
      break;

    case 'authentication_required':
      showError('Votre banque nécessite une authentification supplémentaire.');
      // Handle 3D Secure flow
      handle3DSecure(paymentData.nextAction);
      break;

    case 'incorrect_cvc':
      showError('Le code de sécurité de votre carte est incorrect.');
      // Highlight CVC field
      highlightField('cvc');
      break;

    case 'incorrect_number':
      showError('Le numéro de votre carte est incorrect.');
      // Highlight card number field
      highlightField('cardNumber');
      break;

    case 'invalid_expiry_month':
    case 'invalid_expiry_year':
      showError("La date d'expiration de votre carte est invalide.");
      // Highlight expiry fields
      highlightField('expiry');
      break;

    case 'processing_error':
      showError(
        "Une erreur s'est produite lors du traitement de votre carte. Veuillez réessayer.",
      );
      // Show retry button
      showRetryButton();
      break;

    default:
      showError(errorMessage || 'Une erreur est survenue lors du paiement.');
  }
};
```

### Complete Payment Flow with Error Handling

```javascript
// Complete payment flow with comprehensive error handling
const processPayment = async (sessionId) => {
  try {
    // 1. Create payment intent
    const paymentIntentResponse = await fetch(
      '/api/paymentmethodcard/payment-intent',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer YOUR_JWT_TOKEN',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_session: sessionId,
        }),
      },
    );

    const { clientSecret } = await paymentIntentResponse.json();

    // 2. Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name',
            email: 'customer@example.com',
          },
        },
      },
    );

    if (error) {
      // Handle Stripe client-side errors
      handleStripeError(error);
    } else {
      // 3. Check payment status with detailed error information
      const statusResponse = await fetch(
        `/api/paymentmethodcard/payment-validation/${paymentIntent.id}`,
        {
          headers: {
            Authorization: 'Bearer YOUR_JWT_TOKEN',
          },
        },
      );

      const statusData = await statusResponse.json();

      if (statusData.status === 'succeeded') {
        console.log('✅ Payment successful!');
        // Payment method card and user session are created automatically
        window.location.href = '/payment-success';
      } else {
        handlePaymentError(statusData);
      }
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    showError('Une erreur est survenue lors du traitement du paiement.');
  }
};

// Handle Stripe client-side errors
const handleStripeError = (error) => {
  console.error('Stripe error:', error);

  // Map Stripe errors to our error handling
  const errorMapping = {
    card_declined: 'card_declined',
    insufficient_funds: 'insufficient_funds',
    expired_card: 'expired_card',
    incorrect_cvc: 'incorrect_cvc',
    incorrect_number: 'incorrect_number',
    invalid_expiry_month: 'invalid_expiry_month',
    invalid_expiry_year: 'invalid_expiry_year',
    processing_error: 'processing_error',
    authentication_required: 'authentication_required',
  };

  const errorCode = errorMapping[error.code] || 'unknown_error';
  const errorData = {
    errorCode,
    errorMessage: error.message,
  };

  handlePaymentError(errorData);
};
```

## 🔔 Webhook Integration

The system automatically handles payment failure events via webhooks:

### Webhook Events Handled

- **`payment_intent.succeeded`**: Creates payment method card and user session
- **`payment_intent.payment_failed`**: Logs detailed failure information with error categorization
- **`checkout.session.completed`**: Creates payment method card and user session

### Webhook Setup

1. Configure webhook endpoint in Stripe Dashboard: `https://your-domain.com/api/paymentmethodcard/webhook`
2. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, and `checkout.session.completed`
3. Add webhook secret to environment variables: `STRIPE_WEBHOOK_SECRET`

### Webhook Error Logging

The webhook automatically logs detailed error information for failed payments:

```
❌ [STRIPE WEBHOOK] Payment failed: pi_1234567890abcdef
❌ [STRIPE WEBHOOK] Payment failure reason: { type: 'card_error', code: 'insufficient_funds' }
💰 [STRIPE WEBHOOK] INSUFFICIENT FUNDS detected for payment: pi_1234567890abcdef
```

## 🎨 UI/UX Recommendations

### Error Display

- **Clear Error Messages**: Use the French error messages provided by the API
- **Visual Indicators**: Highlight problematic form fields
- **Action Buttons**: Provide clear next steps (retry, change card, contact support)
- **Alternative Options**: Suggest alternative payment methods for certain errors

### User Experience

- **Immediate Feedback**: Show errors as soon as they occur
- **Progressive Disclosure**: Show detailed error information on demand
- **Recovery Options**: Provide clear paths to resolve payment issues
- **Support Information**: Include contact information for complex issues

## 🔍 Monitoring and Analytics

### Error Tracking

Monitor these error codes for insights:

- **`insufficient_funds`**: High volume may indicate pricing issues
- **`expired_card`**: May indicate user experience issues with card entry
- **`card_declined`**: May indicate fraud or bank policy issues
- **`authentication_required`**: May indicate 3D Secure implementation issues

### Logging

All payment errors are logged with detailed information:

```javascript
// Example log entry
{
  paymentIntentId: 'pi_1234567890abcdef',
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user-123',
  errorCode: 'insufficient_funds',
  errorMessage: 'Fonds insuffisants. Veuillez vérifier votre solde ou utiliser une autre carte.',
  timestamp: '2024-01-15T10:30:00Z'
}
```

## 🚀 Best Practices

1. **Always Check Status**: Use the enhanced status endpoint after payment confirmation
2. **Handle All Error Types**: Implement comprehensive error handling for all possible scenarios
3. **Provide Clear Guidance**: Use the French error messages to guide users
4. **Monitor Error Patterns**: Track error frequencies to identify issues
5. **Test Error Scenarios**: Use Stripe test cards to test different error conditions
6. **Implement Retry Logic**: Allow users to retry payments after fixing issues
7. **Log Everything**: Ensure all payment attempts and errors are logged for debugging

## 🧪 Testing

### Test Cards for Error Scenarios

Use Stripe test cards to test different error conditions:

- **Insufficient Funds**: `4000000000000002`
- **Expired Card**: `4000000000000069`
- **Declined Card**: `4000000000000002`
- **Incorrect CVC**: `4000000000000127`
- **3D Secure Required**: `4000002500003155`

### Example Test Flow

```javascript
// Test insufficient funds scenario
const testInsufficientFunds = async () => {
  // Use test card 4000000000000002
  const { error } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: { number: '4000000000000002' },
    },
  });

  // Should trigger insufficient_funds error
  if (error && error.code === 'card_declined') {
    // Check payment status for detailed error info
    const status = await checkPaymentStatus(paymentIntent.id);
    console.log('Error details:', status.errorDetails);
  }
};
```

This comprehensive payment validation system ensures that users receive clear, actionable feedback for all payment scenarios while providing developers with detailed error information for debugging and monitoring.
