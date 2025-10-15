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
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { JwtAuthGuardAsStudent } from '../guard/guard.asstudent';
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
}
\`\`\`

**Note:** 
- The user ID is automatically extracted from the JWT token
- The status is automatically set to 'pending'
- The training price is automatically fetched from the training session's associated training
- Only the session ID is required from the frontend
    `,
  })
  @ApiBody({
    type: CreatePaymentMethodCardDto,
    schema: {
      type: 'object',
      required: ['id_session'],
      properties: {
        id_session: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
          description:
            'Training session ID that this payment method belongs to',
        },
      },
    },
    examples: {
      example1: {
        summary: 'Payment method card creation',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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

  @Post('payment-success')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Payment Method Card After Successful Payment',
    description: `
# ✅ Payment Success Handler

**Create payment method card and user session after successful Stripe payment**

This endpoint should be called by the frontend after confirming that a Stripe payment was successful.

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
    "id_session": "session-id",
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
    status: 201,
    description: 'Payment method card and user session created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Payment method card and user session created successfully',
        data: {
          id: 'payment-method-card-id',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          id_user: 'user-id',
          id_stripe_payment: 'pi_1234567890abcdef',
          status: 'VALIDATED',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Duplicate payment method or invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createPaymentMethodCardAfterPayment(
    @Body() body: { sessionId: string; stripePaymentIntentId: string },
    @Request() req,
  ) {
    console.log(
      '✅ [PAYMENT SUCCESS CONTROLLER] Creating payment method card after successful payment',
    );
    const userId = req.user.id_user;
    return this.paymentMethodCardService.createPaymentMethodCardAfterPayment(
      body.sessionId,
      userId,
      body.stripePaymentIntentId,
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
    sessionId: 'session-id',
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
- **payment_intent.payment_failed**: Logs failure (no action needed)
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
            '🔔 [STRIPE WEBHOOK] Metadata valid - creating payment method card automatically',
          );
          console.log(
            '🔔 [STRIPE WEBHOOK] Calling createPaymentMethodCardAfterPayment...',
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
