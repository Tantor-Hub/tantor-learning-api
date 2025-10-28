import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
  Response,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentMethodCardService } from './paymentmethodcard.service';
import { CreatePaymentMethodCardDto } from './dto/create-paymentmethodcard.dto';
import { UpdatePaymentMethodCardDto } from './dto/update-paymentmethodcard.dto';
import { DeletePaymentMethodCardDto } from './dto/delete-paymentmethodcard.dto';
import { StripePaymentIntentDto } from './dto/stripe-checkout.dto';
import {
  StripePaymentIntentResponseDto,
  StripePaymentIntentStatusDto,
} from './dto/stripe-session-response.dto';
import { JwtAuthGuardAsStudent } from '../guard/guard.asstudent';
import { JwtAuthGuardAsManagerSystem } from '../guard/guard.asadmin';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { PaymentMethodCardStatus } from '../enums/payment-method-card-status.enum';

@ApiTags('Payment Method Card - Stripe Integration')
@Controller('paymentmethodcard')
export class PaymentMethodCardController {
  constructor(
    private readonly paymentMethodCardService: PaymentMethodCardService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new payment method card',
    description: `
**CreatePaymentMethodCardDto Structure:**
\`\`\`typescript
{
  id_session: string;                    // Required - Training session ID
  stripe_payment_intent_id: string;     // Required - Stripe Payment Intent ID
}
\`\`\`

**Payment Flow:**
- **Payment Intent Required**: Always validates payment and creates paid payment method card + UserInSession
- **No Pending Records**: All records are created only after successful payment validation

**🔐 Webhook Validation:**
- **Real Payment Verification**: All payments are validated via Stripe webhooks
- **Webhook Events**: \`payment_intent.succeeded\` events trigger automatic validation
- **Double Validation**: Payment is validated both at API call and webhook level
- **Security**: Prevents fake or invalid payment records

**📋 Frontend Integration:**
\`\`\`javascript
// 1. Create payment intent
const paymentIntent = await stripe.paymentIntents.create({...});

// 2. Process payment with Stripe.js
const { paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});

// 3. Create records with payment intent ID (validates via webhook)
const response = await fetch('/api/paymentmethodcard/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id_session: '550e8400-e29b-41d4-a716-446655440000',
    stripe_payment_intent_id: confirmedPayment.id
  })
});
\`\`\`

**✅ Validation Process:**
1. **API Validation**: Checks payment intent status, amount, currency, metadata
2. **Webhook Validation**: Stripe webhook confirms payment is real and successful
3. **Record Creation**: Only creates records after both validations pass
4. **Error Handling**: Returns French error messages for all validation failures

**Note:** 
- The user ID is automatically extracted from the JWT token
- Payment must be real and successful (validated by Stripe webhooks)
- Records are only created for valid, webhook-confirmed payments
- French error messages are returned for validation failures
    `,
  })
  @ApiBody({
    type: CreatePaymentMethodCardDto,
    schema: {
      type: 'object',
      required: ['id_session', 'stripe_payment_intent_id'],
      properties: {
        id_session: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
          description:
            'Training session ID that this payment method belongs to',
        },
        stripe_payment_intent_id: {
          type: 'string',
          example: 'pi_1234567890abcdef',
          description:
            'Stripe Payment Intent ID (required - payment will be validated)',
        },
      },
    },
    examples: {
      example1: {
        summary: 'Payment method card creation with payment intent validation',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          stripe_payment_intent_id: 'pi_1234567890abcdef',
        },
      },
      example2: {
        summary: 'Another payment method card creation example',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          stripe_payment_intent_id: 'pi_abcdef1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment method card created successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: 'Payment method card created successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            id_session: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            id_stripe_payment: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: 'pi_1234567890',
            },
            status: {
              type: 'string',
              enum: ['pending', 'rejected', 'validated'],
              example: 'pending',
            },
            id_user: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
              description: 'User ID (automatically extracted from JWT token)',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            trainingSession: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                nb_places: { type: 'number' },
                available_places: { type: 'number' },
                begining_date: { type: 'string', format: 'date-time' },
                ending_date: { type: 'string', format: 'date-time' },
              },
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
              },
            },
            trainingPrice: {
              type: 'number',
              example: 150.0,
              description: 'Training price in euros',
            },
            amountToPay: {
              type: 'number',
              example: 150.0,
              description: 'Amount to pay in euros',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Training session not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'User already has a payment method for this session.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  create(
    @Body() createPaymentMethodCardDto: CreatePaymentMethodCardDto,
    @Request() req,
  ) {
    console.log(
      '[PAYMENT METHOD CARD CONTROLLER] Create endpoint called with data:',
      createPaymentMethodCardDto,
    );
    const userId = req.user.id_user; // Extract user ID from JWT token
    return this.paymentMethodCardService.create(
      createPaymentMethodCardDto,
      userId,
    );
  }

  @Get('getall')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payment methods card' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods card retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Payment methods card retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              id_session: { type: 'string', format: 'uuid' },
              id_stripe_payment: {
                type: 'string',
                format: 'uuid',
                nullable: true,
              },
              status: {
                type: 'string',
                enum: ['pending', 'rejected', 'validated'],
              },
              id_user: {
                type: 'string',
                format: 'uuid',
                description: 'User ID (automatically extracted from JWT token)',
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              trainingSession: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  nb_places: { type: 'number' },
                  available_places: { type: 'number' },
                  begining_date: { type: 'string', format: 'date-time' },
                  ending_date: { type: 'string', format: 'date-time' },
                },
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  firstname: { type: 'string' },
                  lastname: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findAll() {
    return this.paymentMethodCardService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment methods card by user ID (Student access)',
    description:
      'Retrieve all payment methods card for a specific user. This endpoint is designed for students to view their payment methods.',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'User payment methods card retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    console.log(
      `🎓 [STUDENT PAYMENT METHODS CARD] Student requesting payment methods for user: ${userId}`,
    );
    return this.paymentMethodCardService.findByUserId(userId);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment methods card by session ID',
    description:
      'Retrieve all payment methods card for a specific training session.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'UUID of the training session',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Session payment methods card retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findBySessionId(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.paymentMethodCardService.findBySessionId(sessionId);
  }

  @Get('stripe/:stripePaymentId')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment method card by Stripe payment ID',
    description: 'Retrieve payment method card for a specific Stripe payment.',
  })
  @ApiParam({
    name: 'stripePaymentId',
    description: 'Stripe payment ID',
    type: 'string',
    example: 'pi_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method card retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method card not found for this Stripe payment.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findByStripePaymentId(@Param('stripePaymentId') stripePaymentId: string) {
    return this.paymentMethodCardService.findByStripePaymentId(stripePaymentId);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment methods card by status',
    description: 'Retrieve all payment methods card with a specific status.',
  })
  @ApiParam({
    name: 'status',
    description: 'Payment status',
    enum: PaymentMethodCardStatus,
    example: 'pending',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment methods card by status retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findByStatus(@Param('status') status: PaymentMethodCardStatus) {
    return this.paymentMethodCardService.findByStatus(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a payment method card by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the payment method card',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method card retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method card not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentMethodCardService.findOne(id);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a payment method card',
    description: `
**UpdatePaymentMethodCardDto Structure:**
\`\`\`typescript
{
  id: string;                           // Required (to identify which payment method)
  id_session?: string;                  // Optional
  id_stripe_payment?: string;           // Optional
  status?: PaymentMethodCardStatus;     // Optional
}
\`\`\`

**Note:** The user ID is automatically extracted from the JWT token and cannot be updated via this endpoint.
    `,
  })
  @ApiBody({
    type: UpdatePaymentMethodCardDto,
    examples: {
      example1: {
        summary: 'Update payment status',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'validated',
        },
      },
      example2: {
        summary: 'Update Stripe payment ID and status',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          id_stripe_payment: 'pi_1234567890',
          status: 'validated',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method card updated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method card, training session, or user not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  update(@Body() updatePaymentMethodCardDto: UpdatePaymentMethodCardDto) {
    return this.paymentMethodCardService.update(updatePaymentMethodCardDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a payment method card' })
  @ApiBody({
    type: DeletePaymentMethodCardDto,
    examples: {
      example1: {
        summary: 'Delete payment method card by ID',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method card deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method card not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  remove(@Body() deletePaymentMethodCardDto: DeletePaymentMethodCardDto) {
    return this.paymentMethodCardService.remove(deletePaymentMethodCardDto);
  }

  @Delete('delete-all')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete all payment methods card' })
  @ApiResponse({
    status: 200,
    description: 'All payment methods card deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  deleteAll() {
    return this.paymentMethodCardService.deleteAll();
  }

  @Get('secretary/payments')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all Card payments for secretary management',
    description:
      'Retrieve all Card payments with user email, session title, and status for secretary management.',
  })
  @ApiResponse({
    status: 200,
    description: 'Card payments retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Card payments retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              userEmail: { type: 'string', example: 'student@example.com' },
              sessionId: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              sessionTitle: {
                type: 'string',
                example: 'JavaScript Fundamentals',
              },
              status: { type: 'string', example: 'in' },
              paymentStatus: {
                type: 'string',
                enum: ['pending', 'rejected', 'validated'],
                example: 'validated',
              },
              stripePaymentId: {
                type: 'string',
                example: 'pi_1234567890abcdef',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  getSecretaryPayments() {
    return this.paymentMethodCardService.getSecretaryPayments();
  }

  // Stripe Integration Endpoints
  @Post('payment-intent')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Stripe Payment Intent',
    description: `
# 💳 Create Stripe Payment Intent

**Frontend Integration Guide for Card Payments**

## 🚀 Quick Start
This endpoint creates a Stripe Payment Intent for secure card payments. Perfect for training session payments.

## 📋 Frontend Workflow
\`\`\`javascript
// 1. Call this endpoint with training session ID
const response = await fetch('/api/paymentmethodcard/payment-intent', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id_session: '550e8400-e29b-41d4-a716-446655440000' // Training session ID
  })
});

const { clientSecret } = await response.json();

// 2. Use Stripe.js to confirm payment
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'Customer Name' }
  }
});

if (error) {
  console.error('Payment failed:', error);
} else {
  console.log('Payment succeeded!');
}
\`\`\`

## 💰 Automatic Price Fetching
- **Source**: Training session's training.prix field
- **Currency**: EUR (Euro)
- **Conversion**: Automatically converted to cents for Stripe
- **Validation**: Ensures training session and price exist

## 💳 Payment Method Configuration
- **Automatic Payment Methods**: Uses Stripe's automatic payment method detection
- **Card Support**: Automatically supports all major card networks (Visa, Mastercard, etc.)
- **Secure**: Compatible with Stripe Elements for enhanced security
- **Flexible**: Supports various payment methods as configured by Stripe

## 🔐 Authentication
- **Required**: Valid JWT token with student role
- **Header**: \`Authorization: Bearer YOUR_JWT_TOKEN\`
- **Auto-extracted**: User ID from token

## ✅ Success Response
\`\`\`json
{
  "clientSecret": "pi_1234567890abcdef_secret_xyz1234567890"
}
\`\`\`

## ❌ Error Responses
- **400**: Training price not found for this session
- **404**: Training session not found
- **401**: Unauthorized (invalid/missing JWT)
- **500**: Stripe configuration error
    `,
  })
  @ApiBody({
    type: StripePaymentIntentDto,
    description: 'Training session ID to get the training price from',
    examples: {
      trainingSession: {
        summary: 'Training session payment',
        description:
          'Example for a training session - amount will be fetched from training.prix',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      anotherSession: {
        summary: 'Another training session',
        description: 'Example for another training session',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Stripe Payment Intent created successfully. Returns the client secret needed for frontend payment processing.',
    type: StripePaymentIntentResponseDto,
    schema: {
      example: {
        clientSecret: 'pi_1234567890abcdef_secret_xyz1234567890',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Training price not found for this session.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Training price not found for this session',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Training session not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Training session not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized - Invalid or missing JWT token. Student role required.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error - Stripe configuration error or server issue.',
    schema: {
      example: {
        statusCode: 500,
        message:
          'Failed to create payment intent: Stripe secret key not configured',
        error: 'Internal Server Error',
      },
    },
  })
  async createStripePaymentIntent(
    @Body() stripePaymentIntentDto: StripePaymentIntentDto,
    @Request() req,
  ) {
    console.log(
      '💳 [STRIPE PAYMENT INTENT CONTROLLER] Creating payment intent',
    );
    const userId = req.user.id_user;
    return this.paymentMethodCardService.createStripePaymentIntent(
      stripePaymentIntentDto,
      userId,
    );
  }

  @Get('payment-intent/:id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Stripe Payment Intent Status',
    description: `
# 🔍 Check Payment Status

**Verify if your Stripe payment was successful**

## 🚀 Quick Start
Use this endpoint to check the current status of a payment after the frontend has processed it.

## 📋 Frontend Workflow
\`\`\`javascript
// After payment processing, check the status
const paymentIntentId = 'pi_1234567890abcdef'; // Extract from client secret

const response = await fetch(\`/api/paymentmethodcard/payment-intent/\${paymentIntentId}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const { status } = await response.json();

// Handle different statuses
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
\`\`\`

## 📊 Payment Status Values

| Status | Description | Action Required |
|--------|-------------|-----------------|
| \`succeeded\` | ✅ Payment completed successfully | None - redirect to success |
| \`requires_payment_method\` | Payment method required | Retry with new card |
| \`requires_confirmation\` | Payment needs confirmation | Confirm payment |
| \`requires_action\` | 3D Secure authentication needed | Complete authentication |
| \`processing\` | Payment being processed | Wait and check again |
| \`requires_capture\` | Payment authorized, capture needed | Capture payment |
| \`canceled\` | ❌ Payment was canceled | Show error, allow retry |

## 🔐 Authentication
- **Required**: Valid JWT token with student role
- **Header**: \`Authorization: Bearer YOUR_JWT_TOKEN\`

## ✅ Success Response
\`\`\`json
{
  "status": "succeeded"
}
\`\`\`

## ❌ Error Responses
- **400**: Invalid Payment Intent ID format
- **401**: Unauthorized (invalid/missing JWT)
- **500**: Stripe API error or server issue
    `,
  })
  @ApiParam({
    name: 'id',
    description:
      'Stripe Payment Intent ID (extracted from the client secret returned by the create endpoint)',
    type: 'string',
    example: 'pi_1234567890abcdef',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment intent status retrieved successfully.',
    type: StripePaymentIntentStatusDto,
    schema: {
      example: {
        status: 'succeeded',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid Payment Intent ID format or ID does not exist.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid payment intent ID',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized - Invalid or missing JWT token. Student role required.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Stripe API error or server issue.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Failed to retrieve payment intent status: Stripe API error',
        error: 'Internal Server Error',
      },
    },
  })
  async getStripePaymentIntentStatus(
    @Param('id') paymentIntentId: string,
    @Request() req,
  ) {
    console.log(
      '🔍 [STRIPE PAYMENT INTENT CONTROLLER] Getting payment intent status for:',
      paymentIntentId,
    );
    const userId = req.user.id_user;
    return this.paymentMethodCardService.getStripePaymentIntentStatus(
      paymentIntentId,
      userId,
    );
  }

  @Get('payment-validation/:id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Comprehensive Payment Validation with Error Details',
    description: `
# 🔍 Comprehensive Payment Validation

**Enhanced payment status checking with detailed error information for insufficient funds, expired cards, and refused transactions**

This endpoint provides comprehensive payment validation with detailed error categorization and user-friendly messages in French.

## 🚨 Error Handling Features
- **Insufficient Funds**: Detects and provides specific messaging
- **Expired Cards**: Identifies expired card errors
- **Refused Transactions**: Handles various card decline scenarios
- **3D Secure**: Manages authentication requirements
- **Processing Errors**: Categorizes technical issues

## 📋 Response Format
\`\`\`json
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
\`\`\`

## 🔧 Frontend Integration
\`\`\`javascript
// Check payment status with comprehensive error handling
const checkPaymentStatus = async (paymentIntentId) => {
  try {
    const response = await fetch(\`/api/paymentmethodcard/payment-validation/\${paymentIntentId}\`, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
      }
    });
    
    const data = await response.json();
    
    if (data.status === 'succeeded') {
      console.log('✅ Payment successful!');
      // Handle success
    } else if (data.requiresAction) {
      console.log('🔄 Additional action required:', data.nextAction);
      // Handle 3D Secure or other actions
    } else if (data.errorCode) {
      console.error('❌ Payment failed:', data.errorMessage);
      // Handle specific error types
      switch (data.errorCode) {
        case 'insufficient_funds':
          showError('Fonds insuffisants. Veuillez utiliser une autre carte.');
          break;
        case 'expired_card':
          showError('Votre carte a expiré. Veuillez utiliser une carte valide.');
          break;
        case 'card_declined':
          showError('Votre carte a été refusée. Veuillez contacter votre banque.');
          break;
        default:
          showError(data.errorMessage);
      }
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
};
\`\`\`

## 🎯 Use Cases
- **Pre-payment validation**: Check if payment will likely succeed
- **Post-payment verification**: Confirm payment status after processing
- **Error handling**: Provide specific user guidance for different failure types
- **3D Secure flow**: Handle additional authentication requirements
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Stripe Payment Intent ID',
    example: 'pi_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment validation completed successfully.',
    type: StripePaymentIntentStatusDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment intent ID or payment failed.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid payment intent ID' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during payment validation.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: {
          type: 'string',
          example: 'Failed to validate payment: Stripe API error',
        },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  async validatePaymentWithErrorDetails(
    @Param('id') paymentIntentId: string,
    @Request() req,
  ) {
    console.log(
      '🔍 [PAYMENT VALIDATION CONTROLLER] Comprehensive payment validation for:',
      paymentIntentId,
    );
    const userId = req.user.id_user;
    return this.paymentMethodCardService.getStripePaymentIntentStatus(
      paymentIntentId,
      userId,
    );
  }

  @Post('payment-success')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Payment Success Confirmation',
    description: `
# ✅ Payment Success Confirmation

**Confirms that a Stripe payment was successful - NO records are created automatically**

This endpoint should be called by the frontend after confirming that a Stripe payment was successful. It only confirms the payment status and does not create any records.

## ⚠️ Important:
- **No records are created by this endpoint**
- **Use /api/paymentmethodcard/create with payment intent ID to create records**
- **This endpoint only confirms payment success**

## 📋 Frontend Workflow
\`\`\`javascript
// After successful Stripe payment confirmation
const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'Customer Name' }
  }
});

if (paymentIntent.status === 'succeeded') {
  // Call this endpoint to create the payment method card
  const response = await fetch('/api/paymentmethodcard/payment-success', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      stripePaymentIntentId: paymentIntent.id
    })
  });
  
  const result = await response.json();
  console.log('Payment method card created:', result);
}
\`\`\`

## 🔐 Authentication
- **Required**: Valid JWT token with student role
- **Header**: \`Authorization: Bearer YOUR_JWT_TOKEN\`

## ✅ Success Response
\`\`\`json
{
  "status": 201,
  "message": "Payment method card and user session created successfully",
  "data": {
    "id": "payment-method-card-id",
    "id_session": "550e8400-e29b-41d4-a716-446655440000",
    "id_user": "user-id",
    "id_stripe_payment": "pi_1234567890abcdef",
    "status": "PAID"
  }
}
\`\`\`
    `,
  })
  @ApiBody({
    description: 'Payment success data',
    schema: {
      type: 'object',
      required: ['sessionId', 'stripePaymentIntentId'],
      properties: {
        sessionId: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
          description: 'Training session ID',
        },
        stripePaymentIntentId: {
          type: 'string',
          example: 'pi_1234567890abcdef',
          description: 'Stripe Payment Intent ID from successful payment',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully',
    schema: {
      example: {
        status: 200,
        message: 'Payment confirmed successfully',
        data: {
          paymentIntentId: 'pi_1234567890abcdef',
          status: 'succeeded',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Payment validation failed or invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async confirmPaymentSuccess(
    @Body() body: { sessionId: string; stripePaymentIntentId: string },
    @Request() req,
  ) {
    console.log('✅ [PAYMENT SUCCESS CONTROLLER] Confirming payment success');
    const userId = req.user.id_user;

    // Just validate the payment and return confirmation
    const paymentStatus =
      await this.paymentMethodCardService.getStripePaymentIntentStatus(
        body.stripePaymentIntentId,
        userId,
      );

    return paymentStatus;
  }

  @Get('webhook-validation/:id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validate payment via webhook verification',
    description: `
# 🔐 Webhook Payment Validation

**Validates payment authenticity using webhook-level verification**

## 🔒 Security Features
- **Real Payment Verification**: Confirms payment exists in Stripe
- **Freshness Check**: Ensures payment is recent (within 24 hours)
- **Metadata Validation**: Verifies required session and user data
- **Double Validation**: Both API and webhook validation

## 📋 Validation Process
1. **Stripe Verification**: Retrieves payment intent from Stripe
2. **Status Check**: Confirms payment is actually succeeded
3. **Age Verification**: Ensures payment is recent (max 24 hours old)
4. **Metadata Check**: Validates sessionId and userId are present
5. **Security Logging**: Logs all validation steps for audit

## 🎯 Use Cases
- Verify payment authenticity before record creation
- Debug webhook processing issues
- Ensure payment is real and not fake
- Validate payment age and metadata

## 📊 Response Format
\`\`\`json
{
  "status": 200,
  "data": {
    "isValid": true,
    "paymentIntent": {
      "id": "pi_1234567890abcdef",
      "status": "succeeded",
      "amount": 20305,
      "currency": "eur",
      "created": 1640995200,
      "metadata": {
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "userId": "123e4567-e89b-12d3-a456-426614174000"
      }
    },
    "error": null
  },
  "message": "Webhook validation successful"
}
\`\`\`

## ❌ Error Handling
- **Invalid Payment**: Returns 400 if payment doesn't exist
- **Wrong Status**: Returns 400 if payment not succeeded
- **Too Old**: Returns 400 if payment older than 24 hours
- **Missing Metadata**: Returns 400 if required data missing
- **Stripe Error**: Returns 500 if Stripe API fails
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Stripe Payment Intent ID to validate',
    example: 'pi_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook validation successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean', example: true },
            paymentIntent: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'pi_1234567890abcdef' },
                status: { type: 'string', example: 'succeeded' },
                amount: { type: 'number', example: 20305 },
                currency: { type: 'string', example: 'eur' },
                created: { type: 'number', example: 1640995200 },
                metadata: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      example: '550e8400-e29b-41d4-a716-446655440000',
                    },
                    userId: {
                      type: 'string',
                      example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                  },
                },
              },
            },
            error: { type: 'string', example: null },
          },
        },
        message: { type: 'string', example: 'Webhook validation successful' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Webhook validation failed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        data: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Payment not succeeded' },
            paymentIntent: { type: 'object', example: null },
          },
        },
        message: { type: 'string', example: 'Webhook validation failed' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async validateWebhookPayment(@Param('id') paymentIntentId: string) {
    return this.paymentMethodCardService.validateWebhookPayment(
      paymentIntentId,
    );
  }

  @Post('test-create')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Test Payment Method Card Creation',
    description: `
# 🧪 Test Payment Method Card Creation

**Manual endpoint for testing automatic creation**

This endpoint allows you to manually test the payment method card creation process.

## 📋 Usage
\`\`\`javascript
const response = await fetch('/api/paymentmethodcard/test-create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
    stripePaymentIntentId: 'pi_test_1234567890abcdef'
  })
});
\`\`\`
    `,
  })
  @ApiBody({
    description: 'Test data for payment method card creation',
    schema: {
      type: 'object',
      required: ['sessionId', 'stripePaymentIntentId'],
      properties: {
        sessionId: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
          description: 'Training session ID',
        },
        stripePaymentIntentId: {
          type: 'string',
          example: 'pi_test_1234567890abcdef',
          description: 'Stripe Payment Intent ID',
        },
      },
    },
  })
  async testCreatePaymentMethodCard(
    @Body() body: { sessionId: string; stripePaymentIntentId: string },
    @Request() req,
  ) {
    console.log('🧪 [TEST CREATE] Manual test of payment method card creation');
    const userId = req.user.id_user;
    console.log('🧪 [TEST CREATE] User ID:', userId);
    console.log('🧪 [TEST CREATE] Session ID:', body.sessionId);
    console.log(
      '🧪 [TEST CREATE] Stripe Payment Intent ID:',
      body.stripePaymentIntentId,
    );

    return this.paymentMethodCardService.createPaymentMethodCardAfterPayment(
      body.sessionId,
      userId,
      body.stripePaymentIntentId,
    );
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Stripe Webhook Handler',
    description: `
# 🔔 Stripe Webhook Handler

**Automatically handles Stripe payment events**

This endpoint receives webhooks from Stripe when payment events occur. It automatically creates payment method cards and user sessions when payments succeed.

## 🔧 Setup Required
1. Configure webhook endpoint in Stripe Dashboard: \`https://your-domain.com/api/paymentmethodcard/webhook\`
2. Select events: \`payment_intent.succeeded\` and \`checkout.session.completed\`
3. Add webhook secret to environment variables: \`STRIPE_WEBHOOK_SECRET\`

## 📋 Automatic Actions
- **payment_intent.succeeded**: Creates payment method card and user session (for Payment Intents)
- **checkout.session.completed**: Creates payment method card and user session (for Checkout)
- **payment_intent.payment_failed**: Logs detailed failure information with error categorization
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or data',
  })
  async handleStripeWebhook(@Request() req, @Response() res) {
    console.log('🔔 [STRIPE WEBHOOK] ===== WEBHOOK RECEIVED =====');
    console.log(
      '🔔 [STRIPE WEBHOOK] Request body length:',
      req.body?.length || 'undefined',
    );
    console.log(
      '🔔 [STRIPE WEBHOOK] Request headers:',
      JSON.stringify(req.headers, null, 2),
    );
    console.log('🔔 [STRIPE WEBHOOK] Timestamp:', new Date().toISOString());
    console.log(
      '🔔 [STRIPE WEBHOOK] Headers:',
      JSON.stringify(req.headers, null, 2),
    );
    console.log('🔔 [STRIPE WEBHOOK] Body keys:', Object.keys(req.body || {}));

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log(
      '🔔 [STRIPE WEBHOOK] Webhook secret configured:',
      !!webhookSecret,
    );

    if (!webhookSecret) {
      console.log(
        '❌ [STRIPE WEBHOOK] Webhook secret not configured - exiting',
      );
      return res.status(400).send('Webhook secret not configured');
    }

    console.log('🔔 [STRIPE WEBHOOK] Constructing event...');

    try {
      const event = this.paymentMethodCardService.constructWebhookEvent(
        req.body,
        sig,
        webhookSecret,
      );

      console.log('✅ [STRIPE WEBHOOK] Event constructed successfully');
      console.log('🔔 [STRIPE WEBHOOK] Event type:', event.type);
      console.log('🔔 [STRIPE WEBHOOK] Event ID:', event.id);
      console.log(
        '🔔 [STRIPE WEBHOOK] Event data:',
        JSON.stringify(event.data, null, 2),
      );
      console.log(
        '🔔 [STRIPE WEBHOOK] Event data keys:',
        Object.keys(event.data || {}),
      );

      if (event.type === 'payment_intent.succeeded') {
        console.log(
          '🔄 [STRIPE WEBHOOK] Processing payment_intent.succeeded event',
        );
        const paymentIntent = event.data.object;
        console.log('✅ [STRIPE WEBHOOK] Payment succeeded:', paymentIntent.id);
        console.log(
          '✅ [STRIPE WEBHOOK] Payment intent metadata:',
          JSON.stringify(paymentIntent.metadata, null, 2),
        );

        // Extract session ID from metadata
        const sessionId = paymentIntent.metadata?.sessionId;
        const userId = paymentIntent.metadata?.userId;

        console.log(
          '✅ [STRIPE WEBHOOK] Extracted sessionId:',
          sessionId,
          'userId:',
          userId,
        );

        if (sessionId && userId) {
          console.log(
            '🔔 [STRIPE WEBHOOK] Metadata valid - validating payment authenticity',
          );

          // First validate the payment is real and authentic
          const webhookValidation =
            await this.paymentMethodCardService.validateWebhookPayment(
              paymentIntent.id,
            );

          if (!webhookValidation.isValid) {
            console.log(
              '❌ [STRIPE WEBHOOK] Payment validation failed:',
              webhookValidation.error,
            );
            console.log(
              '❌ [STRIPE WEBHOOK] No records will be created for invalid payment',
            );
          } else {
            console.log(
              '✅ [STRIPE WEBHOOK] Payment authenticity confirmed - creating records',
            );

            const result =
              await this.paymentMethodCardService.createPaymentMethodCardAfterPayment(
                sessionId,
                userId,
                paymentIntent.id,
              );
            console.log(
              '✅ [STRIPE WEBHOOK] Payment method card creation result:',
              JSON.stringify(result, null, 2),
            );

            // Check if the result indicates a validation failure
            if (result.status === 400) {
              console.log(
                '❌ [STRIPE WEBHOOK] Payment validation failed - no records created:',
                result.message,
              );
            } else {
              console.log(
                '✅ [STRIPE WEBHOOK] Payment validation successful - records created',
              );
            }
          }

          console.log(
            '✅ [STRIPE WEBHOOK] payment_intent.succeeded processing completed',
          );
        } else {
          console.log(
            '⚠️ [STRIPE WEBHOOK] Missing sessionId or userId in metadata - skipping creation',
          );
        }
      } else if (event.type === 'checkout.session.completed') {
        console.log(
          '🔄 [STRIPE WEBHOOK] Processing checkout.session.completed event',
        );
        const session = event.data.object;
        console.log(
          '✅ [STRIPE WEBHOOK] Checkout session completed:',
          session.id,
        );
        console.log(
          '✅ [STRIPE WEBHOOK] Checkout session metadata:',
          JSON.stringify(session.metadata, null, 2),
        );
        console.log(
          '✅ [STRIPE WEBHOOK] Checkout session payment_intent:',
          session.payment_intent,
        );

        // Extract session ID and user ID from metadata
        const sessionId = session.metadata?.sessionId;
        const userId = session.metadata?.userId;

        console.log(
          '✅ [STRIPE WEBHOOK] Extracted sessionId:',
          sessionId,
          'userId:',
          userId,
        );

        if (sessionId && userId && session.payment_intent) {
          console.log(
            '🔔 [STRIPE WEBHOOK] Metadata and payment_intent valid - creating payment method card automatically for checkout',
          );
          console.log(
            '🔔 [STRIPE WEBHOOK] Calling createPaymentMethodCardAfterPayment for checkout...',
          );
          const result =
            await this.paymentMethodCardService.createPaymentMethodCardAfterPayment(
              sessionId,
              userId,
              session.payment_intent as string,
            );
          console.log(
            '✅ [STRIPE WEBHOOK] Payment method card creation result for checkout:',
            JSON.stringify(result, null, 2),
          );
          console.log(
            '✅ [STRIPE WEBHOOK] checkout.session.completed processing completed',
          );
        } else {
          console.log(
            '⚠️ [STRIPE WEBHOOK] Missing sessionId, userId, or payment_intent in checkout session - skipping creation',
          );
        }
      } else if (event.type === 'payment_intent.payment_failed') {
        console.log(
          '🔄 [STRIPE WEBHOOK] Processing payment_intent.payment_failed event',
        );
        const paymentIntent = event.data.object;
        console.log('❌ [STRIPE WEBHOOK] Payment failed:', paymentIntent.id);
        console.log(
          '❌ [STRIPE WEBHOOK] Payment failure reason:',
          paymentIntent.last_payment_error,
        );
        console.log(
          '❌ [STRIPE WEBHOOK] Payment intent metadata:',
          JSON.stringify(paymentIntent.metadata, null, 2),
        );

        // Extract session ID and user ID from metadata for logging
        const sessionId = paymentIntent.metadata?.sessionId;
        const userId = paymentIntent.metadata?.userId;

        console.log('❌ [STRIPE WEBHOOK] Failed payment details:', {
          paymentIntentId: paymentIntent.id,
          sessionId,
          userId,
          failureReason: paymentIntent.last_payment_error?.message,
          errorCode: paymentIntent.last_payment_error?.code,
          errorType: paymentIntent.last_payment_error?.type,
          declineCode: paymentIntent.last_payment_error?.decline_code,
        });

        // Log specific error types for monitoring
        if (paymentIntent.last_payment_error) {
          // Create a simple error categorization for webhook logging
          const error = paymentIntent.last_payment_error;
          let errorCode = 'unknown_error';
          let errorMessage = 'Payment failed';

          if (error.type === 'card_error') {
            errorCode = error.code || 'card_error';
            switch (error.code) {
              case 'insufficient_funds':
                errorMessage = 'Insufficient funds';
                break;
              case 'expired_card':
                errorMessage = 'Expired card';
                break;
              case 'card_declined':
                errorMessage = 'Card declined';
                break;
              case 'authentication_required':
                errorMessage = 'Authentication required';
                break;
              default:
                errorMessage = error.message || 'Card error';
            }
          }

          const errorInfo = {
            errorCode,
            errorMessage,
            requiresAction: error.code === 'authentication_required',
          };
          console.log('❌ [STRIPE WEBHOOK] Categorized payment failure:', {
            errorCode: errorInfo.errorCode,
            errorMessage: errorInfo.errorMessage,
            requiresAction: errorInfo.requiresAction,
          });

          // Log specific failure types for monitoring
          switch (errorInfo.errorCode) {
            case 'insufficient_funds':
              console.log(
                '💰 [STRIPE WEBHOOK] INSUFFICIENT FUNDS detected for payment:',
                paymentIntent.id,
              );
              break;
            case 'expired_card':
              console.log(
                '📅 [STRIPE WEBHOOK] EXPIRED CARD detected for payment:',
                paymentIntent.id,
              );
              break;
            case 'card_declined':
              console.log(
                '🚫 [STRIPE WEBHOOK] CARD DECLINED detected for payment:',
                paymentIntent.id,
              );
              break;
            case 'authentication_required':
              console.log(
                '🔐 [STRIPE WEBHOOK] AUTHENTICATION REQUIRED for payment:',
                paymentIntent.id,
              );
              break;
            default:
              console.log(
                '⚠️ [STRIPE WEBHOOK] OTHER PAYMENT FAILURE:',
                errorInfo.errorCode,
                'for payment:',
                paymentIntent.id,
              );
          }
        }

        console.log(
          '✅ [STRIPE WEBHOOK] payment_intent.payment_failed processing completed',
        );
      } else {
        console.log(
          'ℹ️ [STRIPE WEBHOOK] Unhandled event type:',
          event.type,
          '- no action taken',
        );
      }

      console.log(
        '✅ [STRIPE WEBHOOK] ===== WEBHOOK PROCESSING COMPLETED =====',
      );
      res.status(200).send('Webhook processed');
    } catch (error) {
      console.error('❌ [STRIPE WEBHOOK] ===== WEBHOOK PROCESSING ERROR =====');
      console.error('❌ [STRIPE WEBHOOK] Error processing webhook:', error);
      console.error('❌ [STRIPE WEBHOOK] Error details:', {
        message: error.message,
        stack: error.stack,
        type: error.type,
        code: error.code,
      });
      console.error('❌ [STRIPE WEBHOOK] ===== END ERROR =====');
      res.status(400).send('Webhook processing failed');
    }
  }
}
