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
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { JwtAuthGuardAsStudent } from '../guard/guard.asstudent';

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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
}
