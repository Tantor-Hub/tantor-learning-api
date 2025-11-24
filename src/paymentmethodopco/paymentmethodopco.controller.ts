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
import { PaymentMethodOpcoService } from './paymentmethodopco.service';
import { CreatePaymentMethodOpcoDto } from './dto/create-paymentmethodopco.dto';
import { UpdatePaymentMethodOpcoDto } from './dto/update-paymentmethodopco.dto';
import { DeletePaymentMethodOpcoDto } from './dto/delete-paymentmethodopco.dto';
import { JwtAuthGuardAsStudent } from '../guard/guard.asstudent';
import { JwtAuthGuardAsManagerSystem } from '../guard/guard.asadmin';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { JwtAuthGuardAdminOrSecretary } from '../guard/guard.multi-role';
import { PaymentMethodOpcoStatus } from '../enums/payment-method-opco-status.enum';

@ApiTags('Payment Method OPCO')
@Controller('paymentmethodopco')
export class PaymentMethodOpcoController {
  constructor(
    private readonly paymentMethodOpcoService: PaymentMethodOpcoService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new payment method OPCO',
    description: `
**CreatePaymentMethodOpcoDto Structure:**
\`\`\`typescript
{
  id_session: string;                    // Required - Training session ID
  nom_opco?: string;                     // Optional - OPCO name
  nom_entreprise: string;                // Required - Company name
  siren: string;                         // Required - SIREN number
  nom_responsable: string;               // Required - Responsible person name
  telephone_responsable: string;         // Required - Responsible person phone
  email_responsable: string;             // Required - Responsible person email
}
\`\`\`

**Note:** The user ID is automatically extracted from the JWT token, and the status is automatically set to 'pending'.
    `,
  })
  @ApiBody({
    type: CreatePaymentMethodOpcoDto,
    examples: {
      example1: {
        summary: 'Basic payment method OPCO creation',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          nom_entreprise: 'Entreprise ABC',
          siren: '123456789',
          nom_responsable: 'Jean Dupont',
          telephone_responsable: '0123456789',
          email_responsable: 'jean.dupont@entreprise.com',
        },
      },
      example2: {
        summary: 'Payment method OPCO with OPCO name',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          nom_opco: 'OPCO Mobilités',
          nom_entreprise: 'Entreprise XYZ',
          siren: '987654321',
          nom_responsable: 'Marie Martin',
          telephone_responsable: '0987654321',
          email_responsable: 'marie.martin@entreprise.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment method OPCO created successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: 'Payment method OPCO created successfully',
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
            nom_opco: {
              type: 'string',
              nullable: true,
              example: 'OPCO Mobilités',
            },
            nom_entreprise: {
              type: 'string',
              example: 'Entreprise ABC',
            },
            siren: {
              type: 'string',
              example: '123456789',
            },
            nom_responsable: {
              type: 'string',
              example: 'Jean Dupont',
            },
            telephone_responsable: {
              type: 'string',
              example: '0123456789',
            },
            email_responsable: {
              type: 'string',
              example: 'jean.dupont@entreprise.com',
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
    description:
      'User already has a payment method for this session. Only one payment method per session is allowed.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  create(
    @Body() createPaymentMethodOpcoDto: CreatePaymentMethodOpcoDto,
    @Request() req,
  ) {
    console.log(
      '🚀 [PAYMENT METHOD OPCO CONTROLLER] ===== CREATE ENDPOINT CALLED =====',
    );
    console.log(
      '📝 [PAYMENT METHOD OPCO CONTROLLER] Request data:',
      JSON.stringify(createPaymentMethodOpcoDto, null, 2),
    );
    console.log(
      '👤 [PAYMENT METHOD OPCO CONTROLLER] Request user object:',
      JSON.stringify(req.user, null, 2),
    );

    const userId = req.user.id_user; // Extract user ID from JWT token
    console.log(
      '🆔 [PAYMENT METHOD OPCO CONTROLLER] Extracted user ID:',
      userId,
    );

    if (!userId) {
      console.log(
        '❌ [PAYMENT METHOD OPCO CONTROLLER] ERROR: No user ID found in request!',
      );
      return {
        status: 400,
        message: 'User ID not found in authentication token',
        data: null,
      };
    }

    console.log(
      '✅ [PAYMENT METHOD OPCO CONTROLLER] Calling service with userId:',
      userId,
    );
    return this.paymentMethodOpcoService.create(
      createPaymentMethodOpcoDto,
      userId,
    );
  }

  @Get('getall')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payment methods OPCO' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods OPCO retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Payment methods OPCO retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              id_session: { type: 'string', format: 'uuid' },
              nom_opco: { type: 'string', nullable: true },
              nom_entreprise: { type: 'string' },
              siren: { type: 'string' },
              nom_responsable: { type: 'string' },
              telephone_responsable: { type: 'string' },
              email_responsable: { type: 'string' },
              status: {
                type: 'string',
                enum: ['pending', 'rejected', 'validated'],
              },
              id_user: { type: 'string', format: 'uuid' },
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
    description: 'Unauthorized - Admin or Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findAll() {
    return this.paymentMethodOpcoService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment methods OPCO by user ID (Student access)',
    description:
      'Retrieve all payment methods OPCO for a specific user. This endpoint is designed for students to view their payment methods.',
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
    description: 'User payment methods OPCO retrieved successfully.',
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
      `🎓 [STUDENT PAYMENT METHODS OPCO] Student requesting payment methods for user: ${userId}`,
    );
    return this.paymentMethodOpcoService.findByUserId(userId);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment methods OPCO by session ID',
    description:
      'Retrieve all payment methods OPCO for a specific training session.',
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
    description: 'Session payment methods OPCO retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin or Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findBySessionId(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.paymentMethodOpcoService.findBySessionId(sessionId);
  }

  @Get('siren/:siren')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment methods OPCO by SIREN',
    description:
      'Retrieve all payment methods OPCO for a specific SIREN number.',
  })
  @ApiParam({
    name: 'siren',
    description: 'SIREN number of the company',
    type: 'string',
    example: '123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment methods OPCO by SIREN retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin or Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findBySiren(@Param('siren') siren: string) {
    return this.paymentMethodOpcoService.findBySiren(siren);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment methods OPCO by status',
    description: 'Retrieve all payment methods OPCO with a specific status.',
  })
  @ApiParam({
    name: 'status',
    description: 'Payment status',
    enum: PaymentMethodOpcoStatus,
    example: 'pending',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment methods OPCO by status retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin or Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findByStatus(@Param('status') status: PaymentMethodOpcoStatus) {
    return this.paymentMethodOpcoService.findByStatus(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a payment method OPCO by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the payment method OPCO',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method OPCO retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method OPCO not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin or Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentMethodOpcoService.findOne(id);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a payment method OPCO',
    description: `
**UpdatePaymentMethodOpcoDto Structure:**
\`\`\`typescript
{
  id: string;                           // Required (to identify which payment method)
  id_session?: string;                  // Optional
  nom_opco?: string;                    // Optional
  nom_entreprise?: string;              // Optional
  siren?: string;                       // Optional
  nom_responsable?: string;             // Optional
  telephone_responsable?: string;       // Optional
  email_responsable?: string;           // Optional
  status?: PaymentMethodOpcoStatus;     // Optional
  id_user?: string;                     // Optional
}
\`\`\`

**Note:** This endpoint is accessible to administrators only.
    `,
  })
  @ApiBody({
    type: UpdatePaymentMethodOpcoDto,
    examples: {
      example1: {
        summary: 'Update payment status',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'validated',
        },
      },
      example2: {
        summary: 'Update company information',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nom_entreprise: 'Nouvelle Entreprise',
          siren: '987654321',
          status: 'validated',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method OPCO updated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method OPCO, training session, or user not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  update(@Body() updatePaymentMethodOpcoDto: UpdatePaymentMethodOpcoDto) {
    return this.paymentMethodOpcoService.update(updatePaymentMethodOpcoDto);
  }

  @Patch('secretary/update')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a payment method OPCO (Secretary access)',
    description: `
**UpdatePaymentMethodOpcoDto Structure:**
\`\`\`typescript
{
  id: string;                           // Required (to identify which payment method)
  id_session?: string;                  // Optional
  nom_opco?: string;                    // Optional
  nom_entreprise?: string;              // Optional
  siren?: string;                       // Optional
  nom_responsable?: string;             // Optional
  telephone_responsable?: string;       // Optional
  email_responsable?: string;           // Optional
  status?: PaymentMethodOpcoStatus;     // Optional
  id_user?: string;                     // Optional
}
\`\`\`

**Note:** This endpoint allows secretaries to modify payment methods OPCO created by students.
    `,
  })
  @ApiBody({
    type: UpdatePaymentMethodOpcoDto,
    examples: {
      example1: {
        summary: 'Update payment status',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'validated',
        },
      },
      example2: {
        summary: 'Update company information',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nom_entreprise: 'Nouvelle Entreprise',
          siren: '987654321',
          status: 'validated',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method OPCO updated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method OPCO, training session, or user not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  updateSecretary(@Body() updatePaymentMethodOpcoDto: UpdatePaymentMethodOpcoDto) {
    return this.paymentMethodOpcoService.update(updatePaymentMethodOpcoDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a payment method OPCO' })
  @ApiBody({
    type: DeletePaymentMethodOpcoDto,
    examples: {
      example1: {
        summary: 'Delete payment method OPCO by ID',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method OPCO deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin or Secretary role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method OPCO not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  remove(@Body() deletePaymentMethodOpcoDto: DeletePaymentMethodOpcoDto) {
    return this.paymentMethodOpcoService.remove(deletePaymentMethodOpcoDto);
  }

  @Delete('delete-all')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete all payment methods OPCO' })
  @ApiResponse({
    status: 200,
    description: 'All payment methods OPCO deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin or Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  deleteAll() {
    return this.paymentMethodOpcoService.deleteAll();
  }

  @Get('secretary/payments')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all OPCO payments for secretary management',
    description:
      'Retrieve all OPCO payments with user email, session title, and status for secretary management.',
  })
  @ApiResponse({
    status: 200,
    description: 'OPCO payments retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'OPCO payments retrieved successfully',
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
              nomOpco: { type: 'string', example: 'OPCO Mobilités' },
              nomEntreprise: { type: 'string', example: 'Entreprise ABC' },
              siren: { type: 'string', example: '123456789' },
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
    return this.paymentMethodOpcoService.getSecretaryPayments();
  }

  @Patch('secretary/update-status')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update OPCO payment status for secretary management',
    description:
      'Update the status of an OPCO payment and the corresponding UserInSession status.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'sessionId', 'status'],
      properties: {
        userId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'User ID',
        },
        sessionId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Session ID',
        },
        status: {
          type: 'string',
          enum: ['pending', 'rejected', 'validated'],
          example: 'validated',
          description: 'New payment status',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OPCO payment status updated successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'OPCO payment status updated successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            siren: { type: 'string' },
            nom_responsable: { type: 'string' },
            telephone_responsable: { type: 'string' },
            email_responsable: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'rejected', 'validated'],
            },
            id_user: { type: 'string', format: 'uuid' },
            id_session: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or payment not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  updateSecretaryPaymentStatus(
    @Body() body: { userId: string; sessionId: string; status: string },
  ) {
    return this.paymentMethodOpcoService.updateSecretaryPaymentStatus(
      body.userId,
      body.sessionId,
      body.status,
    );
  }
}
