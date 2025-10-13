import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SecretaryService } from './secretary.service';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { UpdatePaymentMethodCpfDto } from '../paymentmethodcpf/dto/update-paymentmethodcpf.dto';
import { UpdatePaymentMethodOpcoDto } from '../paymentmethodopco/dto/update-paymentmethodopco.dto';
import { PaymentMethodCpfStatus } from '../enums/payment-method-cpf-status.enum';
import { PaymentMethodOpcoStatus } from '../enums/payment-method-opco-status.enum';
import { User } from '../strategy/strategy.globaluser';
import { IJwtSignin } from '../interface/interface.payloadjwtsignin';

@ApiTags('Secretary - Payment Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuardAsSecretary)
@Controller('secretary')
export class SecretaryController {
  constructor(private readonly secretaryService: SecretaryService) {}

  @Get('payments/cpf')
  @ApiOperation({
    summary: 'Get all CPF payment methods for secretary review',
    description:
      'Retrieves all CPF payment methods with their details for secretary review and management',
  })
  @ApiResponse({
    status: 200,
    description: 'CPF payment methods retrieved successfully',
    example: {
      status: 200,
      message: 'CPF payment methods retrieved successfully',
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          status: 'pending',
          id_user: '550e8400-e29b-41d4-a716-446655440002',
          updatedBy: null,
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
          user: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'React Development Course',
            description: 'Learn React from basics to advanced',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async getAllCpfPayments() {
    return this.secretaryService.getAllCpfPayments();
  }

  @Get('payments/opco')
  @ApiOperation({
    summary: 'Get all OPCO payment methods for secretary review',
    description:
      'Retrieves all OPCO payment methods with their details for secretary review and management',
  })
  @ApiResponse({
    status: 200,
    description: 'OPCO payment methods retrieved successfully',
    example: {
      status: 200,
      message: 'OPCO payment methods retrieved successfully',
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          nom_opco: 'OPCO Mobilités',
          status: 'pending',
          id_user: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
          user: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
          },
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'JavaScript Fundamentals',
            description: 'Learn JavaScript from basics to advanced',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async getAllOpcoPayments() {
    return this.secretaryService.getAllOpcoPayments();
  }

  @Get('payments/cpf/:id')
  @ApiOperation({
    summary: 'Get specific CPF payment method details',
    description:
      'Retrieves detailed information about a specific CPF payment method',
  })
  @ApiParam({
    name: 'id',
    description: 'CPF payment method UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'CPF payment method retrieved successfully',
    example: {
      status: 200,
      message: 'CPF payment method retrieved successfully',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        id_session: '550e8400-e29b-41d4-a716-446655440001',
        status: 'pending',
        id_user: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        trainingSession: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'React Development Course',
          description: 'Learn React from basics to advanced',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'CPF payment method not found',
    example: {
      status: 404,
      message: 'CPF payment method not found',
      data: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async getCpfPaymentById(@Param('id') id: string) {
    return this.secretaryService.getCpfPaymentById(id);
  }

  @Get('payments/opco/:id')
  @ApiOperation({
    summary: 'Get specific OPCO payment method details',
    description:
      'Retrieves detailed information about a specific OPCO payment method',
  })
  @ApiParam({
    name: 'id',
    description: 'OPCO payment method UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'OPCO payment method retrieved successfully',
    example: {
      status: 200,
      message: 'OPCO payment method retrieved successfully',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        id_session: '550e8400-e29b-41d4-a716-446655440001',
        nom_opco: 'OPCO Mobilités',
        status: 'pending',
        id_user: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        },
        trainingSession: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'JavaScript Fundamentals',
          description: 'Learn JavaScript from basics to advanced',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'OPCO payment method not found',
    example: {
      status: 404,
      message: 'OPCO payment method not found',
      data: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async getOpcoPaymentById(@Param('id') id: string) {
    return this.secretaryService.getOpcoPaymentById(id);
  }

  @Patch('payments/cpf/:id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate CPF payment method',
    description:
      'Validates a CPF payment method and sends email notification to the user',
  })
  @ApiParam({
    name: 'id',
    description: 'CPF payment method UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'CPF payment method validated successfully',
    example: {
      status: 200,
      message: 'CPF payment method validated successfully',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        id_session: '550e8400-e29b-41d4-a716-446655440001',
        status: 'validated',
        id_user: '550e8400-e29b-41d4-a716-446655440002',
        updatedBy: '550e8400-e29b-41d4-a716-446655440999',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'CPF payment method not found',
    example: {
      status: 404,
      message: 'CPF payment method not found',
      data: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async validateCpfPayment(@Param('id') id: string, @User() user: IJwtSignin) {
    return this.secretaryService.updateCpfPaymentStatus(
      id,
      PaymentMethodCpfStatus.VALIDATED,
      user.id_user,
    );
  }

  @Patch('payments/cpf/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject CPF payment method',
    description:
      'Rejects a CPF payment method and sends email notification to the user',
  })
  @ApiParam({
    name: 'id',
    description: 'CPF payment method UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'CPF payment method rejected successfully',
    example: {
      status: 200,
      message: 'CPF payment method rejected successfully',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        id_session: '550e8400-e29b-41d4-a716-446655440001',
        status: 'rejected',
        id_user: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'CPF payment method not found',
    example: {
      status: 404,
      message: 'CPF payment method not found',
      data: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async rejectCpfPayment(@Param('id') id: string, @User() user: IJwtSignin) {
    return this.secretaryService.updateCpfPaymentStatus(
      id,
      PaymentMethodCpfStatus.REJECTED,
      user.id_user,
    );
  }

  @Patch('payments/opco/:id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate OPCO payment method',
    description:
      'Validates an OPCO payment method and sends email notification to the user',
  })
  @ApiParam({
    name: 'id',
    description: 'OPCO payment method UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'OPCO payment method validated successfully',
    example: {
      status: 200,
      message: 'OPCO payment method validated successfully',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        id_session: '550e8400-e29b-41d4-a716-446655440001',
        nom_opco: 'OPCO Mobilités',
        status: 'validated',
        id_user: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'OPCO payment method not found',
    example: {
      status: 404,
      message: 'OPCO payment method not found',
      data: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async validateOpcoPayment(@Param('id') id: string, @User() user: IJwtSignin) {
    return this.secretaryService.updateOpcoPaymentStatus(
      id,
      PaymentMethodOpcoStatus.VALIDATED,
      user.id_user,
    );
  }

  @Patch('payments/opco/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject OPCO payment method',
    description:
      'Rejects an OPCO payment method and sends email notification to the user',
  })
  @ApiParam({
    name: 'id',
    description: 'OPCO payment method UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'OPCO payment method rejected successfully',
    example: {
      status: 200,
      message: 'OPCO payment method rejected successfully',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        id_session: '550e8400-e29b-41d4-a716-446655440001',
        nom_opco: 'OPCO Mobilités',
        status: 'rejected',
        id_user: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'OPCO payment method not found',
    example: {
      status: 404,
      message: 'OPCO payment method not found',
      data: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async rejectOpcoPayment(@Param('id') id: string, @User() user: IJwtSignin) {
    return this.secretaryService.updateOpcoPaymentStatus(
      id,
      PaymentMethodOpcoStatus.REJECTED,
      user.id_user,
    );
  }

  @Patch('payments/cpf/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update CPF payment method (full update)',
    description:
      'Updates a CPF payment method with full data including status and sends email notification if status changes',
  })
  @ApiParam({
    name: 'id',
    description: 'CPF payment method UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdatePaymentMethodCpfDto,
    description: 'CPF payment method update data',
    examples: {
      validate: {
        summary: 'Validate CPF Payment',
        description: 'Update CPF payment status to validated',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'validated',
        },
      },
      reject: {
        summary: 'Reject CPF Payment',
        description: 'Update CPF payment status to rejected',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'rejected',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'CPF payment method updated successfully',
    example: {
      status: 200,
      message: 'CPF payment method updated successfully',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        id_session: '550e8400-e29b-41d4-a716-446655440001',
        status: 'validated',
        id_user: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'CPF payment method not found',
    example: {
      status: 404,
      message: 'CPF payment method not found',
      data: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async updateCpfPayment(
    @Param('id') id: string,
    @Body() updatePaymentMethodCpfDto: UpdatePaymentMethodCpfDto,
    @User() user: IJwtSignin,
  ) {
    return this.secretaryService.updateCpfPayment(
      id,
      updatePaymentMethodCpfDto,
      user.id_user,
    );
  }

  @Patch('payments/opco/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update OPCO payment method (full update)',
    description:
      'Updates an OPCO payment method with full data including status and sends email notification if status changes',
  })
  @ApiParam({
    name: 'id',
    description: 'OPCO payment method UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdatePaymentMethodOpcoDto,
    description: 'OPCO payment method update data',
    examples: {
      validate: {
        summary: 'Validate OPCO Payment',
        description: 'Update OPCO payment status to validated',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'validated',
        },
      },
      reject: {
        summary: 'Reject OPCO Payment',
        description: 'Update OPCO payment status to rejected',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'rejected',
        },
      },
      updateUser: {
        summary: 'Update OPCO Payment User',
        description: 'Update OPCO payment user and status',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'validated',
          id_user: '550e8400-e29b-41d4-a716-446655440003',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OPCO payment method updated successfully',
    example: {
      status: 200,
      message: 'OPCO payment method updated successfully',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        id_session: '550e8400-e29b-41d4-a716-446655440001',
        nom_opco: 'OPCO Mobilités',
        status: 'validated',
        id_user: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'OPCO payment method not found',
    example: {
      status: 404,
      message: 'OPCO payment method not found',
      data: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async updateOpcoPayment(
    @Param('id') id: string,
    @Body() updatePaymentMethodOpcoDto: UpdatePaymentMethodOpcoDto,
    @User() user: IJwtSignin,
  ) {
    return this.secretaryService.updateOpcoPayment(
      id,
      updatePaymentMethodOpcoDto,
      user.id_user,
    );
  }

  @Get('payments/pending')
  @ApiOperation({
    summary: 'Get all pending payment methods (CPF and OPCO)',
    description:
      'Retrieves all pending payment methods from both CPF and OPCO for secretary review',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending payment methods retrieved successfully',
    example: {
      status: 200,
      message: 'Pending payment methods retrieved successfully',
      data: {
        cpf: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            id_session: '550e8400-e29b-41d4-a716-446655440001',
            status: 'pending',
            id_user: '550e8400-e29b-41d4-a716-446655440002',
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
        opco: [
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            id_session: '550e8400-e29b-41d4-a716-446655440001',
            nom_opco: 'OPCO Mobilités',
            status: 'pending',
            id_user: '550e8400-e29b-41d4-a716-446655440004',
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
        total: 2,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async getPendingPayments() {
    return this.secretaryService.getPendingPayments();
  }

  @Get('payments/statistics')
  @ApiOperation({
    summary: 'Get payment statistics for secretary dashboard',
    description:
      'Retrieves comprehensive payment statistics for CPF and OPCO payments for secretary dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
    example: {
      status: 200,
      message: 'Payment statistics retrieved successfully',
      data: {
        cpf: {
          total: 25,
          pending: 8,
          validated: 15,
          rejected: 2,
        },
        opco: {
          total: 18,
          pending: 5,
          validated: 12,
          rejected: 1,
        },
        total: {
          total: 43,
          pending: 13,
          validated: 27,
          rejected: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    example: {
      status: 401,
      message: 'Unauthorized',
      data: null,
    },
  })
  async getPaymentStatistics() {
    return this.secretaryService.getPaymentStatistics();
  }
}
