import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { StudentevaluationService } from './studentevaluation.service';
import { CreateStudentevaluationDto } from './dto/create-studentevaluation.dto';
import { UpdateStudentevaluationDto } from './dto/update-studentevaluation.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('Student Evaluations')
@Controller('studentevaluation')
export class StudentevaluationController {
  constructor(
    private readonly studentevaluationService: StudentevaluationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Create a new student evaluation',
    description:
      'Create a new student evaluation. The lecturerId is automatically set to the authenticated user.',
  })
  @ApiBody({
    type: CreateStudentevaluationDto,
    description: 'Student evaluation data',
    examples: {
      basic: {
        summary: 'Basic Student Evaluation',
        description: 'Create a basic student evaluation',
        value: {
          title: 'React Fundamentals Assessment',
          description:
            'This evaluation tests students on React fundamentals including components, state, and props.',
          isImmediateResult: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student evaluation created successfully',
    example: {
      status: 201,
      message: 'Student evaluation created successfully',
      data: {
        id: 'eval-uuid-1',
        title: 'React Fundamentals Assessment',
        description:
          'This evaluation tests students on React fundamentals including components, state, and props.',
        lecturerId: 'lecturer-uuid-1',
        isImmediateResult: false,
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body()
    createStudentevaluationDto: Omit<CreateStudentevaluationDto, 'lecturerId'>,
    @User() user: IJwtSignin,
  ) {
    const evaluationData = {
      ...createStudentevaluationDto,
      lecturerId: user.id_user,
    };
    return this.studentevaluationService.create(evaluationData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all student evaluations' })
  @ApiResponse({
    status: 200,
    description: 'Student evaluations retrieved successfully',
    example: {
      status: 200,
      message: 'Student evaluations retrieved successfully',
      data: [
        {
          id: 'eval-uuid-1',
          title: 'React Fundamentals Assessment',
          description:
            'This evaluation tests students on React fundamentals including components, state, and props.',
          lecturerId: 'lecturer-uuid-1',
          isImmediateResult: false,
          lecturer: {
            id: 'lecturer-uuid-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          questions: [
            {
              id: 'question-uuid-1',
              type: 'multiple_choice',
              text: 'What is the correct way to create a React component?',
              points: 1,
            },
          ],
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.studentevaluationService.findAll();
  }

  @Get('lecturer/my-evaluations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get evaluations created by current lecturer',
    description:
      'Retrieve all evaluations created by the currently authenticated lecturer',
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByLecturer(@User() user: IJwtSignin) {
    return this.studentevaluationService.findByLecturer(user.id_user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get student evaluation by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student evaluation UUID',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluation retrieved successfully',
    example: {
      status: 200,
      message: 'Student evaluation retrieved successfully',
      data: {
        id: 'eval-uuid-1',
        title: 'React Fundamentals Assessment',
        description:
          'This evaluation tests students on React fundamentals including components, state, and props.',
        lecturerId: 'lecturer-uuid-1',
        isImmediateResult: false,
        lecturer: {
          id: 'lecturer-uuid-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        questions: [
          {
            id: 'question-uuid-1',
            type: 'multiple_choice',
            text: 'What is the correct way to create a React component?',
            points: 1,
            isImmediateResult: false,
            options: [
              {
                id: 'option-uuid-1',
                text: 'Using function components with hooks',
                isCorrect: true,
              },
              {
                id: 'option-uuid-2',
                text: 'Using class components only',
                isCorrect: false,
              },
            ],
          },
        ],
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student evaluation not found' })
  findOne(@Param('id') id: string) {
    return this.studentevaluationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update student evaluation by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student evaluation UUID',
    example: 'eval-uuid-1',
  })
  @ApiBody({
    type: UpdateStudentevaluationDto,
    description: 'Student evaluation update data',
    examples: {
      basic: {
        summary: 'Basic Update',
        description: 'Update basic evaluation information',
        value: {
          title: 'Updated React Fundamentals Assessment',
          description: 'Updated description for the React assessment.',
          isImmediateResult: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluation updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student evaluation not found' })
  update(
    @Param('id') id: string,
    @Body() updateStudentevaluationDto: UpdateStudentevaluationDto,
  ) {
    return this.studentevaluationService.update(id, updateStudentevaluationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete student evaluation by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student evaluation UUID',
    example: 'eval-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student evaluation deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student evaluation not found' })
  remove(@Param('id') id: string) {
    return this.studentevaluationService.remove(id);
  }
}
