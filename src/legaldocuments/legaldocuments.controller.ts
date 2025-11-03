import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { LegalDocumentsService } from './legaldocuments.service';
import { CreateLegalDocumentDto } from './dto/create-legal-document.dto';
import { UpdateLegalDocumentDto } from './dto/update-legal-document.dto';
import { LegalDocumentType } from 'src/models/model.legaldocument';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('Legal Documents')
@Controller('legal-documents')
export class LegalDocumentsController {
  constructor(private readonly legalDocumentsService: LegalDocumentsService) {}

  @Post('admin')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a legal document (Admin only)',
    description:
      'Create a new legal document. Each document type can only exist once.',
  })
  @ApiBody({ type: CreateLegalDocumentDto })
  @ApiResponse({
    status: 201,
    description: 'Legal document created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Document of this type already exists',
  })
  async create(
    @Body() createDto: CreateLegalDocumentDto,
    @User() user: IJwtSignin,
  ) {
    return this.legalDocumentsService.create(createDto, user.id_user);
  }

  @Put('admin/:type')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a legal document (Admin only)',
    description: 'Update the content of an existing legal document by type.',
  })
  @ApiParam({
    name: 'type',
    enum: LegalDocumentType,
    description: 'Type of legal document to update',
  })
  @ApiBody({ type: UpdateLegalDocumentDto })
  @ApiResponse({
    status: 200,
    description: 'Legal document updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async update(
    @Param('type') type: LegalDocumentType,
    @Body() updateDto: UpdateLegalDocumentDto,
    @User() user: IJwtSignin,
  ) {
    return this.legalDocumentsService.update(type, updateDto, user.id_user);
  }

  @Delete('admin/:type')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a legal document (Admin only)',
    description: 'Delete a legal document by type.',
  })
  @ApiParam({
    name: 'type',
    enum: LegalDocumentType,
    description: 'Type of legal document to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Legal document deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async delete(@Param('type') type: LegalDocumentType) {
    return this.legalDocumentsService.delete(type);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all legal documents (Admin only)',
    description: 'Get all legal documents with admin access.',
  })
  @ApiResponse({
    status: 200,
    description: 'Legal documents retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async getAllAdmin() {
    return this.legalDocumentsService.getAll();
  }

  @Get('admin/:type')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a legal document by type (Admin only)',
    description: 'Get a specific legal document by type with admin access.',
  })
  @ApiParam({
    name: 'type',
    enum: LegalDocumentType,
    description: 'Type of legal document to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Legal document retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async getByTypeAdmin(@Param('type') type: LegalDocumentType) {
    return this.legalDocumentsService.getByType(type);
  }

  @Get('public/getall')
  @ApiOperation({
    summary: 'Get all legal documents (Public)',
    description:
      'Get all legal documents. This endpoint is public and does not require authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Legal documents retrieved successfully',
  })
  async getAllPublic() {
    return this.legalDocumentsService.getAll();
  }

  @Get('public/:type')
  @ApiOperation({
    summary: 'Get a legal document by type (Public)',
    description:
      'Get a specific legal document by type. This endpoint is public and does not require authentication.',
  })
  @ApiParam({
    name: 'type',
    enum: LegalDocumentType,
    description: 'Type of legal document to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Legal document retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async getByTypePublic(@Param('type') type: LegalDocumentType) {
    return this.legalDocumentsService.getByType(type);
  }
}
