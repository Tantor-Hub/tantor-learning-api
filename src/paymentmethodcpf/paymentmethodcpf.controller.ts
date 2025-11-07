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
import { PaymentMethodCpfService } from './paymentmethodcpf.service';
import { CreatePaymentMethodCpfDto } from './dto/create-paymentmethodcpf.dto';
import { UpdatePaymentMethodCpfDto } from './dto/update-paymentmethodcpf.dto';
import { JwtAuthGuardAsStudent } from '../guard/guard.asstudent';
import { JwtAuthGuardAsManagerSystem } from '../guard/guard.asadmin';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';

@ApiTags('Payment Method CPF')
@Controller('paymentmethodcpf')
export class PaymentMethodCpfController {
  constructor(
    private readonly paymentMethodCpfService: PaymentMethodCpfService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new payment method CPF (Student access)',
    description:
      'Create a new payment method CPF. The user ID is automatically extracted from the JWT token.',
  })
  @ApiBody({
    type: CreatePaymentMethodCpfDto,
    examples: {
      example1: {
        summary: 'Basic payment method CPF creation',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment method CPF created successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Training session or user not found.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - User already has a payment method for this session.',
  })
  create(
    @Body() createPaymentMethodCpfDto: CreatePaymentMethodCpfDto,
    @Request() req: any,
  ) {
    console.log(
      '🎯 [PAYMENT METHOD CPF] Create request received for session:',
      createPaymentMethodCpfDto.id_session,
    );

    // Extract user ID from JWT token
    const id_user = req.user?.id_user;

    // Add user ID from token to the DTO
    const createDtoWithUser = {
      ...createPaymentMethodCpfDto,
      id_user: id_user,
    };

    return this.paymentMethodCpfService.create(createDtoWithUser);
  }

  @Get('getall')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payment methods CPF' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods CPF retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  findAll() {
    return this.paymentMethodCpfService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a payment method CPF by ID' })
  @ApiParam({
    name: 'id',
    description: 'Payment method CPF ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method CPF retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method CPF not found.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentMethodCpfService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a payment method CPF' })
  @ApiParam({
    name: 'id',
    description: 'Payment method CPF ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdatePaymentMethodCpfDto })
  @ApiResponse({
    status: 200,
    description: 'Payment method CPF updated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method CPF not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentMethodCpfDto: UpdatePaymentMethodCpfDto,
  ) {
    return this.paymentMethodCpfService.update(id, updatePaymentMethodCpfDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a payment method CPF' })
  @ApiParam({
    name: 'id',
    description: 'Payment method CPF ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment method CPF deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment method CPF not found.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentMethodCpfService.remove(id);
  }

  @Get('secretary/payments')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all CPF payments for secretary management',
    description:
      'Retrieve all CPF payments with user email, session title, and status for secretary management.',
  })
  @ApiResponse({
    status: 200,
    description: 'CPF payments retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'CPF payments retrieved successfully',
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
    return this.paymentMethodCpfService.getSecretaryPayments();
  }

  @Patch('secretary/update-status')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update CPF payment status for secretary management',
    description:
      'Update the status of a CPF payment and the corresponding UserInSession status.',
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
    description: 'CPF payment status updated successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'CPF payment status updated successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
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
    return this.paymentMethodCpfService.updateSecretaryPaymentStatus(
      body.userId,
      body.sessionId,
      body.status,
    );
  }
}
