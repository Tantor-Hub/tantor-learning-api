import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { FillDocumentDto } from './dto/fill-document.dto';
import { UpdateDocumentInstanceSecretaryDto } from './dto/update-document-instance-secretary.dto';
import { JwtAuthGuard } from '../guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { DocumentSwagger } from './swagger.documents';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.createTemplate)
  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto, @Req() req) {
    return this.documentsService.createTemplate(dto, req.user.id_user);
  }

  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.updateTemplate)
  @Patch('templates/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @Req() req,
  ) {
    return this.documentsService.updateTemplate(id, dto, req.user.id_user);
  }

  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.getAllTemplates)
  @Get('templates')
  getAllTemplates() {
    return this.documentsService.getAllTemplates();
  }

  @ApiOperation(DocumentSwagger.getTemplateById)
  @Get('templates/:id')
  getTemplateById(@Param('id') id: string) {
    return this.documentsService.getTemplateById(id);
  }

  @ApiOperation(DocumentSwagger.getTemplatesBySessionId)
  @Get('templates/session/:sessionId')
  getTemplatesBySessionId(@Param('sessionId') sessionId: string) {
    return this.documentsService.getTemplatesBySessionId(sessionId);
  }

  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.deleteTemplate)
  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string, @Req() req) {
    return this.documentsService.deleteTemplate(id, req.user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.fillDocument)
  @Post('instances')
  fillDocument(@Body() dto: FillDocumentDto, @Req() req) {
    return this.documentsService.fillDocument(dto, req.user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.getUserDocuments)
  @Get('instances/my')
  getUserDocuments(@Req() req) {
    return this.documentsService.getUserDocuments(req.user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.getDocumentInstanceById)
  @Get('instances/:id')
  getDocumentInstanceById(@Param('id') id: string, @Req() req) {
    return this.documentsService.getDocumentInstanceById(id, req.user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.updateDocumentInstance)
  @Put('instances/:id')
  updateDocumentInstance(
    @Param('id') id: string,
    @Body() body: { filledContent: object; variableValues?: object; is_published?: boolean },
    @Req() req,
  ) {
    return this.documentsService.updateDocumentInstance(
      id,
      req.user.id_user,
      body.filledContent,
      body.variableValues,
      body.is_published,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.deleteDocumentInstance)
  @Delete('instances/:id')
  deleteDocumentInstance(@Param('id') id: string, @Req() req) {
    return this.documentsService.deleteDocumentInstance(id, req.user.id_user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update my document instance',
    description:
      "Updates the filled content and/or variable values and/or is_published of the authenticated student's own document instance.",
  })
  @Patch('instances/:id')
  updateMyDocumentInstance(
    @Param('id') id: string,
    @Body() body: { filledContent?: object; variableValues?: object; is_published?: boolean },
    @Req() req,
  ) {
    return this.documentsService.updateDocumentInstance(
      id,
      req.user.id_user,
      body.filledContent ?? {},
      body.variableValues,
      body.is_published,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.getMyDocumentInstancesByTemplate)
  @ApiResponse(DocumentSwagger.getMyDocumentInstancesByTemplate.responses[200])
  @ApiResponse(DocumentSwagger.getMyDocumentInstancesByTemplate.responses[401])
  @ApiResponse(DocumentSwagger.getMyDocumentInstancesByTemplate.responses[404])
  @Get('instances/by-template/:templateId')
  getMyDocumentInstancesByTemplate(
    @Param('templateId') templateId: string,
    @Req() req,
  ) {
    return this.documentsService.getDocumentInstancesByTemplateForUser(
      templateId,
      req.user.id_user,
    );
  }

  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.getAllDocumentInstancesForSecretary)
  @ApiQuery({
    name: 'sessionId',
    required: false,
    type: String,
    format: 'uuid',
    description:
      'Optional training session ID filter. If not provided, returns all document instances from all sessions.',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'validated', 'rejected'],
    description:
      'Optional document instance status filter. If not provided, returns document instances with all statuses.',
    example: 'pending',
  })
  @ApiResponse(DocumentSwagger.getAllDocumentInstancesForSecretary.responses[200])
  @ApiResponse(DocumentSwagger.getAllDocumentInstancesForSecretary.responses[401])
  @Get('instances/secretary/all')
  getAllDocumentInstancesForSecretary(
    @Query('sessionId') sessionId?: string,
    @Query('status') status?: 'pending' | 'validated' | 'rejected',
  ) {
    return this.documentsService.getAllDocumentInstancesForSecretary(
      sessionId,
      status,
    );
  }

  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.getDocumentInstanceByIdForSecretary)
  @ApiResponse(DocumentSwagger.getDocumentInstanceByIdForSecretary.responses[200])
  @ApiResponse(DocumentSwagger.getDocumentInstanceByIdForSecretary.responses[401])
  @ApiResponse(DocumentSwagger.getDocumentInstanceByIdForSecretary.responses[404])
  @Get('instances/secretary/:id')
  getDocumentInstanceByIdForSecretary(@Param('id') id: string) {
    return this.documentsService.getDocumentInstanceByIdForSecretary(id);
  }

  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(DocumentSwagger.updateDocumentInstanceBySecretary)
  @ApiResponse(DocumentSwagger.updateDocumentInstanceBySecretary.responses[200])
  @ApiResponse(DocumentSwagger.updateDocumentInstanceBySecretary.responses[401])
  @ApiResponse(DocumentSwagger.updateDocumentInstanceBySecretary.responses[404])
  @Patch('instances/secretary/update/:id')
  updateDocumentInstanceBySecretary(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentInstanceSecretaryDto,
    @Req() req,
  ) {
    return this.documentsService.updateDocumentInstanceBySecretary(
      id,
      req.user.id_user,
      dto.status,
      dto.comment,
    );
  }
}
