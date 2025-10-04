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
import { StudentAnswerOptionService } from './studentansweroption.service';
import { CreateStudentAnswerOptionDto } from './dto/create-studentansweroption.dto';
import { UpdateStudentAnswerOptionDto } from './dto/update-studentansweroption.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';

@ApiTags('Student Answer Options')
@Controller('studentansweroption')
export class StudentAnswerOptionController {
  constructor(
    private readonly studentAnswerOptionService: StudentAnswerOptionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({
    summary: 'Select an option for a student answer',
    description:
      'Select a specific option for a multiple choice question answer',
  })
  @ApiBody({
    type: CreateStudentAnswerOptionDto,
    description: 'Student answer option data',
    examples: {
      selectOption: {
        summary: 'Select Option',
        description: 'Select an option for a multiple choice answer',
        value: {
          studentAnswerId: 'answer-uuid-1',
          optionId: 'option-uuid-1',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student answer option created successfully',
    example: {
      status: 201,
      message: 'Student answer option created successfully',
      data: {
        id: 'answer-option-uuid-1',
        studentAnswerId: 'answer-uuid-1',
        optionId: 'option-uuid-1',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createStudentAnswerOptionDto: CreateStudentAnswerOptionDto) {
    return this.studentAnswerOptionService.create(createStudentAnswerOptionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all student answer options' })
  @ApiResponse({
    status: 200,
    description: 'Student answer options retrieved successfully',
    example: {
      status: 200,
      message: 'Student answer options retrieved successfully',
      data: [
        {
          id: 'answer-option-uuid-1',
          studentAnswerId: 'answer-uuid-1',
          optionId: 'option-uuid-1',
          studentAnswer: {
            id: 'answer-uuid-1',
            answerText: null,
            isCorrect: true,
          },
          option: {
            id: 'option-uuid-1',
            text: 'Using function components with hooks',
            isCorrect: true,
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.studentAnswerOptionService.findAll();
  }

  @Get('student-answer/:studentAnswerId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get options by student answer ID' })
  @ApiParam({
    name: 'studentAnswerId',
    description: 'Student answer UUID',
    example: 'answer-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer options retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByStudentAnswer(@Param('studentAnswerId') studentAnswerId: string) {
    return this.studentAnswerOptionService.findByStudentAnswer(studentAnswerId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get student answer option by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student answer option UUID',
    example: 'answer-option-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer option retrieved successfully',
    example: {
      status: 200,
      message: 'Student answer option retrieved successfully',
      data: {
        id: 'answer-option-uuid-1',
        studentAnswerId: 'answer-uuid-1',
        optionId: 'option-uuid-1',
        studentAnswer: {
          id: 'answer-uuid-1',
          answerText: null,
          isCorrect: true,
        },
        option: {
          id: 'option-uuid-1',
          text: 'Using function components with hooks',
          isCorrect: true,
        },
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student answer option not found' })
  findOne(@Param('id') id: string) {
    return this.studentAnswerOptionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({ summary: 'Update student answer option by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student answer option UUID',
    example: 'answer-option-uuid-1',
  })
  @ApiBody({
    type: UpdateStudentAnswerOptionDto,
    description: 'Student answer option update data',
    examples: {
      changeOption: {
        summary: 'Change Option',
        description: 'Change the selected option',
        value: {
          optionId: 'option-uuid-2',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer option updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student answer option not found' })
  update(
    @Param('id') id: string,
    @Body() updateStudentAnswerOptionDto: UpdateStudentAnswerOptionDto,
  ) {
    return this.studentAnswerOptionService.update(
      id,
      updateStudentAnswerOptionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({ summary: 'Delete student answer option by ID' })
  @ApiParam({
    name: 'id',
    description: 'Student answer option UUID',
    example: 'answer-option-uuid-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Student answer option deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student answer option not found' })
  remove(@Param('id') id: string) {
    return this.studentAnswerOptionService.remove(id);
  }
}
