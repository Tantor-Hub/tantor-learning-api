import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { AddFieldsDto } from './dto/add-fields.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new document',
    description: 'Upload a document for a lesson',
  })
  @ApiBody({ type: CreateDocumentDto })
  @ApiResponse({ status: 201, description: 'Document created' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  create(@Body() dto: CreateDocumentDto) {
    return this.documentsService.createDocument(dto);
  }

  @Post(':id/fields')
  @ApiOperation({ summary: 'Add fillable fields to a document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiBody({ type: AddFieldsDto })
  @ApiResponse({ status: 201, description: 'Fields added' })
  addFields(@Param('id') id: string, @Body() dto: AddFieldsDto) {
    return this.documentsService.addFields(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document with its fields' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document with fields returned' })
  getDocument(@Param('id') id: string) {
    return this.documentsService.getDocument(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a response to a document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiBody({ type: SubmitResponseDto })
  @ApiResponse({ status: 201, description: 'Response saved' })
  submit(@Param('id') id: string, @Body() dto: SubmitResponseDto) {
    return this.documentsService.submitResponse(id, dto);
  }

  @UseGuards(JwtAuthGuardAsManagerSystem)
  @Get(':id/responses')
  @ApiOperation({ summary: 'Get all responses for a document (admin only)' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'List of responses returned' })
  getResponses(@Param('id') id: string) {
    return this.documentsService.getResponses(id);
  }

  @Post('upload/signature')
  @ApiOperation({ summary: 'Upload a signature image (PNG) to use in fields' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Signature or logo image (PNG/JPG/WebP) captured from screen or uploaded',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 201, description: 'Signature image uploaded' })
  uploadSignature(@UploadedFile() file: Express.Multer.File) {
    return this.documentsService.uploadSignatureImage(file);
  }
}
