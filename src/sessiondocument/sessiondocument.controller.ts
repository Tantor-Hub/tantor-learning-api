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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { SessionDocumentService } from './sessiondocument.service';
import { CreateSessionDocumentDto } from './dto/create-sessiondocument.dto';
import { UpdateSessionDocumentDto } from './dto/update-sessiondocument.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('Session Documents')
@ApiBearerAuth()
@Controller('sessiondocument')
@UseGuards(JwtAuthGuard)
export class SessionDocumentController {
  constructor(
    private readonly sessionDocumentService: SessionDocumentService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Create a new session document' })
  @ApiBody({
    type: CreateSessionDocumentDto,
    examples: {
      default: {
        summary: 'Create session document example',
        value: {
          type: 'Identity Card',
          id_student: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'before',
          piece_jointe: 'https://example.com/documents/id-card.pdf',
          status: 'pending',
        },
      },
      minimal: {
        summary: 'Minimal session document creation',
        value: {
          type: 'Passport',
          id_student: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'before',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Session document created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Session document created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          type: 'Identity Card',
          id_student: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'before',
          piece_jointe: 'https://example.com/documents/id-card.pdf',
          status: 'pending',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Student or training session not found',
    schema: {
      example: {
        status: 400,
        message: 'Student not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async create(
    @User() user: IJwtSignin,
    @Body() createSessionDocumentDto: CreateSessionDocumentDto,
  ) {
    return this.sessionDocumentService.create(createSessionDocumentDto, user);
  }

  @Get('getall')
  @ApiOperation({ summary: 'Get all session documents' })
  @ApiResponse({
    status: 200,
    description: 'Session documents retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session documents retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            type: 'Identity Card',
            id_student: '550e8400-e29b-41d4-a716-446655440000',
            id_session: '550e8400-e29b-41d4-a716-446655440001',
            categories: 'before',
            piece_jointe: 'https://example.com/documents/id-card.pdf',
            status: 'pending',
            student: {
              uuid: '550e8400-e29b-41d4-a716-446655440000',
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'Advanced React Development',
            },
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  async findAll() {
    return this.sessionDocumentService.findAll();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get session documents by student ID' })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Session documents retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session documents retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            type: 'Identity Card',
            id_student: '550e8400-e29b-41d4-a716-446655440000',
            id_session: '550e8400-e29b-41d4-a716-446655440001',
            categories: 'before',
            piece_jointe: 'https://example.com/documents/id-card.pdf',
            status: 'pending',
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'Advanced React Development',
            },
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  async findByStudentId(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.sessionDocumentService.findByStudentId(studentId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get session documents by training session ID' })
  @ApiParam({
    name: 'sessionId',
    description: 'Training session UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Session documents retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session documents retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            type: 'Identity Card',
            id_student: '550e8400-e29b-41d4-a716-446655440000',
            id_session: '550e8400-e29b-41d4-a716-446655440001',
            categories: 'before',
            piece_jointe: 'https://example.com/documents/id-card.pdf',
            status: 'pending',
            student: {
              uuid: '550e8400-e29b-41d4-a716-446655440000',
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  async findBySessionId(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.sessionDocumentService.findBySessionId(sessionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session document by ID' })
  @ApiParam({
    name: 'id',
    description: 'Session document UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Session document retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session document retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          type: 'Identity Card',
          id_student: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'before',
          piece_jointe: 'https://example.com/documents/id-card.pdf',
          status: 'pending',
          student: {
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Advanced React Development',
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session document not found',
    schema: {
      example: {
        status: 404,
        message: 'Session document not found',
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionDocumentService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update session document by ID' })
  @ApiParam({
    name: 'id',
    description: 'Session document UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiBody({
    type: UpdateSessionDocumentDto,
    examples: {
      updateStatus: {
        summary: 'Update document status',
        value: {
          status: 'validated',
        },
      },
      updateAll: {
        summary: 'Update all fields',
        value: {
          type: 'Passport',
          categories: 'during',
          piece_jointe: 'https://example.com/documents/passport.pdf',
          status: 'validated',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Session document updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session document updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          type: 'Passport',
          id_student: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'during',
          piece_jointe: 'https://example.com/documents/passport.pdf',
          status: 'validated',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-16T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session document not found',
    schema: {
      example: {
        status: 404,
        message: 'Session document not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async update(
    @User() user: IJwtSignin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSessionDocumentDto: UpdateSessionDocumentDto,
  ) {
    return this.sessionDocumentService.update(
      user,
      id,
      updateSessionDocumentDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete session document by ID' })
  @ApiParam({
    name: 'id',
    description: 'Session document UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Session document deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session document deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session document not found',
    schema: {
      example: {
        status: 404,
        message: 'Session document not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionDocumentService.remove(id);
  }
}
