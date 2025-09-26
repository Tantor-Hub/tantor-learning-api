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
import { StudentSessionService } from './studentsession.service';
import { CreateStudentSessionDto } from './dto/create-studentsession.dto';
import { UpdateStudentSessionDto } from './dto/update-studentsession.dto';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Student Sessions')
@ApiBearerAuth()
@Controller('studentsession')
export class StudentSessionController {
  constructor(private readonly studentSessionService: StudentSessionService) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Enroll a student in a training session',
    description: 'Create a new student session enrollment',
  })
  @ApiBody({
    type: CreateStudentSessionDto,
    examples: {
      example1: {
        summary: 'Enroll student in training session',
        value: {
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          id_student: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student enrolled in training session successfully',
    schema: {
      example: {
        status: 201,
        message: 'Student enrolled in training session successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          id_student: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Advanced React Development Session',
            nb_places: 30,
            available_places: 25,
            begining_date: '2024-03-15T09:00:00.000Z',
            ending_date: '2024-03-20T17:00:00.000Z',
          },
          student: {
            id: 1,
            uuid: '550e8400-e29b-41d4-a716-446655440001',
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Student already enrolled or invalid data',
    schema: {
      example: {
        status: 400,
        data: 'Student is already enrolled in this training session',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Training session or student not found',
    schema: {
      example: {
        status: 404,
        data: 'Training session not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: { message: 'Error message' },
        message: 'Erreur interne du serveur',
      },
    },
  })
  create(@Body() createStudentSessionDto: CreateStudentSessionDto) {
    return this.studentSessionService.create(createStudentSessionDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Get all student session enrollments',
    description:
      'Retrieve all student session enrollments with their relationships',
  })
  @ApiResponse({
    status: 200,
    description: 'Student sessions retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Student sessions retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            id_student: '550e8400-e29b-41d4-a716-446655440001',
            createdAt: '2025-01-25T10:00:00.000Z',
            updatedAt: '2025-01-25T10:00:00.000Z',
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Advanced React Development Session',
            },
            student: {
              uuid: '550e8400-e29b-41d4-a716-446655440001',
              fs_name: 'John',
              ls_name: 'Doe',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: { message: 'Error message' },
        message: 'Erreur interne du serveur',
      },
    },
  })
  findAll() {
    return this.studentSessionService.findAll();
  }

  @Get('training-session/:trainingSessionId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Get students enrolled in a training session',
    description:
      'Retrieve all students enrolled in a specific training session',
  })
  @ApiParam({
    name: 'trainingSessionId',
    description: 'Training session ID to get enrolled students for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Student sessions retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Student sessions retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            id_student: '550e8400-e29b-41d4-a716-446655440001',
            createdAt: '2025-01-25T10:00:00.000Z',
            updatedAt: '2025-01-25T10:00:00.000Z',
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Advanced React Development Session',
              nb_places: 30,
              available_places: 25,
            },
            student: {
              uuid: '550e8400-e29b-41d4-a716-446655440001',
              fs_name: 'John',
              ls_name: 'Doe',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: { message: 'Error message' },
        message: 'Erreur interne du serveur',
      },
    },
  })
  findByTrainingSessionId(
    @Param('trainingSessionId', ParseUUIDPipe) trainingSessionId: string,
  ) {
    return this.studentSessionService.findByTrainingSessionId(
      trainingSessionId,
    );
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Get training sessions for a student',
    description:
      'Retrieve all training sessions that a specific student is enrolled in',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID to get training sessions for',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Student sessions retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Student sessions retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            id_student: '550e8400-e29b-41d4-a716-446655440001',
            createdAt: '2025-01-25T10:00:00.000Z',
            updatedAt: '2025-01-25T10:00:00.000Z',
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Advanced React Development Session',
            },
            student: {
              uuid: '550e8400-e29b-41d4-a716-446655440001',
              fs_name: 'John',
              ls_name: 'Doe',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: { message: 'Error message' },
        message: 'Erreur interne du serveur',
      },
    },
  })
  findByStudentId(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.studentSessionService.findByStudentId(studentId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Get student session by ID',
    description: 'Retrieve a specific student session enrollment by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Student session ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Student session retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Student session retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          id_student: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Advanced React Development Session',
            nb_places: 30,
            available_places: 25,
            begining_date: '2024-03-15T09:00:00.000Z',
            ending_date: '2024-03-20T17:00:00.000Z',
          },
          student: {
            id: 1,
            uuid: '550e8400-e29b-41d4-a716-446655440001',
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Student session not found',
    schema: {
      example: {
        status: 404,
        data: 'Student session not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: { message: 'Error message' },
        message: 'Erreur interne du serveur',
      },
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentSessionService.findOne(id);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Update student session enrollment',
    description: 'Update an existing student session enrollment',
  })
  @ApiBody({
    type: UpdateStudentSessionDto,
    examples: {
      example1: {
        summary: 'Update student session',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          id_student: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Student session updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Student session updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          id_session: '550e8400-e29b-41d4-a716-446655440000',
          id_student: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:30:00.000Z',
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Advanced React Development Session',
            nb_places: 30,
            available_places: 25,
            begining_date: '2024-03-15T09:00:00.000Z',
            ending_date: '2024-03-20T17:00:00.000Z',
          },
          student: {
            id: 1,
            uuid: '550e8400-e29b-41d4-a716-446655440001',
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Student session, training session, or student not found',
    schema: {
      example: {
        status: 404,
        data: 'Student session not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: { message: 'Error message' },
        message: 'Erreur interne du serveur',
      },
    },
  })
  update(@Body() updateStudentSessionDto: UpdateStudentSessionDto) {
    return this.studentSessionService.update(
      updateStudentSessionDto.id,
      updateStudentSessionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Delete student session enrollment',
    description: 'Remove a student from a training session',
  })
  @ApiParam({
    name: 'id',
    description: 'Student session ID to delete',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Student session deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Student session deleted successfully',
        data: { id: '550e8400-e29b-41d4-a716-446655440002' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Student session not found',
    schema: {
      example: {
        status: 404,
        data: 'Student session not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: { message: 'Error message' },
        message: 'Erreur interne du serveur',
      },
    },
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentSessionService.remove(id);
  }
}
