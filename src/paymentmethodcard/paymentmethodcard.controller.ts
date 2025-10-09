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
@ApiOperation({
  summary: 'Payment Method Card Management with Stripe Integration',
  description: `
**Complete Payment Method Card Management with Stripe Payment Processing**

This controller provides comprehensive functionality for managing card payment methods and processing payments through Stripe.

**Key Features:**
- Create, read, update, and delete payment method cards
- Stripe Payment Intent integration for secure payment processing
- Automatic user ID extraction from JWT tokens
- Comprehensive duplicate payment prevention
- Training price integration
- French error messages for better user experience

**Authentication:**
- Create operations: Student role required
- Read/Update/Delete operations: Secretary role required
- All endpoints require valid JWT token

**Stripe Integration:**
- Uses Stripe Payment Intents for secure payment processing
- Returns client secrets for frontend payment confirmation
- Supports real-time payment status checking
- Handles all Stripe error scenarios gracefully

**Data Validation:**
- Comprehensive input validation with class-validator
- Database-level unique constraints to prevent duplicates
- Automatic training price fetching from session data
  `,
})
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
**Create a Stripe Payment Intent for card payments**

This endpoint creates a Stripe Payment Intent and returns the client secret. The frontend uses this to process payments directly with Stripe.js.

**How it works:**
1. Frontend calls this endpoint with the amount to pay
2. Backend creates a Stripe Payment Intent
3. Backend returns the client secret
4. Frontend uses Stripe.js to confirm the payment with the client secret
5. Payment is processed securely through Stripe

**Amount Format:**
- Amount must be specified in cents (smallest currency unit)
- Example: 15000 = 150.00 EUR, 2500 = 25.00 EUR

**Authentication:**
- Requires valid JWT token with student role
- User ID is automatically extracted from the token

**Error Handling:**
- 400: Invalid amount or request data
- 401: Unauthorized (invalid or missing JWT token)
- 500: Stripe configuration error or internal server error
    `,
  })
  @ApiBody({
    type: StripePaymentIntentDto,
    description: 'Payment intent creation data',
    examples: {
      trainingSession: {
        summary: 'Training session payment (150.00 EUR)',
        description: 'Example for a training session costing 150.00 EUR',
        value: {
          amount: 15000,
        },
      },
      smallAmount: {
        summary: 'Small amount payment (25.00 EUR)',
        description: 'Example for a smaller payment of 25.00 EUR',
        value: {
          amount: 2500,
        },
      },
      largeAmount: {
        summary: 'Large amount payment (500.00 EUR)',
        description: 'Example for a larger payment of 500.00 EUR',
        value: {
          amount: 50000,
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
    description:
      'Bad Request - Invalid amount or request data. Amount must be a positive number in cents.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Amount must be a positive number',
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
  ) {
    console.log(
      '💳 [STRIPE PAYMENT INTENT CONTROLLER] Creating payment intent',
    );
    return this.paymentMethodCardService.createStripePaymentIntent(
      stripePaymentIntentDto,
    );
  }

  @Get('payment-intent/:id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Stripe Payment Intent Status',
    description: `
**Retrieve the payment status of a Stripe Payment Intent**

This endpoint checks the current status of a Stripe Payment Intent to determine if the payment was successful or if additional action is required.

**How it works:**
1. Frontend provides the Payment Intent ID (from the client secret)
2. Backend queries Stripe for the current status
3. Backend returns the payment status

**Payment Status Values:**
- \`requires_payment_method\`: Payment method is required
- \`requires_confirmation\`: Payment requires confirmation
- \`requires_action\`: Additional authentication required (3D Secure)
- \`processing\`: Payment is being processed
- \`requires_capture\`: Payment authorized, capture required
- \`canceled\`: Payment was canceled
- \`succeeded\`: Payment completed successfully ✅

**Authentication:**
- Requires valid JWT token with student role
- User ID is automatically extracted from the token

**Error Handling:**
- 400: Invalid Payment Intent ID
- 401: Unauthorized (invalid or missing JWT token)
- 500: Stripe API error or internal server error
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
  async getStripePaymentIntentStatus(@Param('id') paymentIntentId: string) {
    console.log(
      '🔍 [STRIPE PAYMENT INTENT CONTROLLER] Getting payment intent status for:',
      paymentIntentId,
    );
    return this.paymentMethodCardService.getStripePaymentIntentStatus(
      paymentIntentId,
    );
  }
}
