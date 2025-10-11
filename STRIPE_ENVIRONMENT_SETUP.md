# 🔧 Stripe Environment Setup Guide

## **Required Environment Variables**

Add these variables to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## **How to Get Your Stripe Keys**

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/
2. **Login** to your Stripe account
3. **Get Test Keys** (for development):
   - Go to **Developers** → **API keys**
   - Copy **Publishable key** (starts with `pk_test_`)
   - Copy **Secret key** (starts with `sk_test_`)

## **Environment File Example**

Your `.env` file should look like this:

```bash
# Database Configuration
APP_BD_DIALECT=postgres
APP_BD_HOST=localhost
APP_BD_PORT=5432
APP_BD_USERNAME=postgres
APP_BD_PASSWORD=your_password
APP_BD_NAME=your_database_name
APP_BD_NAME_TEST=your_test_database_name
APP_BD_SSL=false

# Application Configuration
NODE_ENV=development
PORT=3737

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51ABC123...your_actual_key_here
STRIPE_PUBLIC_KEY=pk_test_51ABC123...your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...your_webhook_secret_here

# Cloudinary Configuration (if needed)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## **Important Notes**

- ✅ **Use Test Keys** during development (`sk_test_` and `pk_test_`)
- ✅ **Never commit** your `.env` file to version control
- ✅ **Restart your server** after adding environment variables
- ✅ **Test with small amounts** (e.g., 50 cents = 50 in the API)

## **Testing the Setup**

1. **Start your server**: `npm run start:dev`
2. **Check Swagger**: Go to `http://localhost:3737/api`
3. **Test Payment Intent**: Use the `/paymentmethodcard/payment-intent` endpoint
4. **Verify logs**: Check console for Stripe connection messages

## **Frontend Integration**

The frontend will need:

- **Public Key**: `STRIPE_PUBLIC_KEY` for Stripe.js
- **API Endpoints**:
  - `POST /paymentmethodcard/payment-intent` (create payment)
  - `GET /paymentmethodcard/payment-intent/:id` (check status)
