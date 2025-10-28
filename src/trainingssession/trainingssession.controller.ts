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
import { TrainingSessionService } from './trainingssession.service';
import { CreateTrainingSessionDto } from './dto/create-trainingssession.dto';
import { UpdateTrainingSessionDto } from './dto/update-trainingssession.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { JwtAuthGuardAsStudent } from '../guard/guard.asstudent';
import { JwtAuthGuardAsStudentInSession } from '../guard/guard.asstudentinsession';
import { JwtAuthGuard } from '../guard/guard.asglobal';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { TrainingSessionResponse } from '../swagger/swagger.responses';
import {
  TrainingSessionApiTags,
  TrainingSessionCreateApiOperation,
  TrainingSessionCreateApiBody,
  TrainingSessionFindAllApiOperation,
  TrainingSessionFindByTrainingIdApiOperation,
  TrainingSessionFindByTrainingIdApiParam,
  TrainingSessionFindOneApiOperation,
  TrainingSessionFindOneApiParam,
  TrainingSessionUpdateApiOperation,
  TrainingSessionUpdateApiBody,
  TrainingSessionUpdatePaymentApiOperation,
  TrainingSessionUpdatePaymentApiBody,
  TrainingSessionUpdatePaymentApiResponse,
  TrainingSessionDeleteApiOperation,
  TrainingSessionDeleteApiParam,
  TrainingSessionCreateApiResponse,
  TrainingSessionFindAllApiResponse,
  TrainingSessionFindByTrainingIdApiResponse,
  TrainingSessionFindOneApiResponse,
  TrainingSessionUpdateApiResponse,
  TrainingSessionDeleteApiResponse,
  TrainingSessionBadRequestApiResponse,
  TrainingSessionNotFoundApiResponse,
  TrainingSessionTrainingNotFoundApiResponse,
  TrainingSessionInternalServerErrorApiResponse,
} from '../swagger/swagger.trainingssession';

@TrainingSessionApiTags()
@Controller('trainingssession')
export class TrainingSessionController {
  constructor(
    private readonly trainingSessionService: TrainingSessionService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @TrainingSessionCreateApiOperation()
  @TrainingSessionCreateApiBody()
  @TrainingSessionCreateApiResponse()
  @TrainingSessionBadRequestApiResponse()
  @TrainingSessionTrainingNotFoundApiResponse()
  @TrainingSessionInternalServerErrorApiResponse()
  create(@Body() createTrainingSessionDto: CreateTrainingSessionDto) {
    return this.trainingSessionService.create(createTrainingSessionDto);
  }

  @Get('getall')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @TrainingSessionFindAllApiOperation()
  @TrainingSessionFindAllApiResponse()
  @TrainingSessionInternalServerErrorApiResponse()
  findAll() {
    return this.trainingSessionService.findAll();
  }

  @Get('training/:trainingId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @TrainingSessionFindByTrainingIdApiOperation()
  @TrainingSessionFindByTrainingIdApiParam()
  @TrainingSessionFindByTrainingIdApiResponse()
  @TrainingSessionInternalServerErrorApiResponse()
  findByTrainingId(@Param('trainingId', ParseUUIDPipe) trainingId: string) {
    return this.trainingSessionService.findByTrainingId(trainingId);
  }

  @Get('student/training/:trainingId')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get training sessions by training ID (Student access)',
    description:
      'Retrieve all training sessions for a specific training. This endpoint is designed for students to view available sessions for a training they are interested in.',
  })
  @ApiParam({
    name: 'trainingId',
    description: 'UUID of the training',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Training sessions retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Training sessions retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '2198c4bd-5386-4a03-a767-eaf78067030a',
              },
              title: {
                type: 'string',
                example: "L'histoire generale de l'afrique",
              },
              nb_places: { type: 'number', example: 10 },
              available_places: { type: 'number', example: 0 },
              begining_date: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-01T22:00:00.000Z',
              },
              ending_date: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-31T22:00:00.000Z',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-01T11:45:13.413Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-01T12:03:27.863Z',
              },
              trainings: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    example: "L'histoire de l'Afrique",
                  },
                  subtitle: {
                    type: 'string',
                    example: "L'histoire de l'afrique antique",
                  },
                  description: {
                    type: 'string',
                    example: 'who is ramses II',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findByTrainingIdForStudent(
    @Param('trainingId', ParseUUIDPipe) trainingId: string,
  ) {
    console.log(
      `🎓 [STUDENT TRAINING SESSIONS] Student requesting sessions for training: ${trainingId}`,
    );
    return this.trainingSessionService.findByTrainingIdForStudent(trainingId);
  }

  @Get('student/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get training session by ID (Student access)',
    description:
      'Retrieve a specific training session by its ID. This endpoint is designed for students to view detailed information about a particular training session.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the training session',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Training session retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Opération réussie.',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'd6ff1fd6-f795-47a3-9abd-24d911d06b22',
            },
            title: {
              type: 'string',
              example: 'hello javascript',
            },
            payment_method: {
              type: 'array',
              items: { type: 'string' },
              nullable: true,
              example: null,
            },
            cpf_link: {
              type: 'string',
              nullable: true,
              example: null,
            },
            survey: {
              type: 'array',
              items: { type: 'string' },
              nullable: true,
              example: null,
            },
            regulation_text: {
              type: 'string',
              example: 'hello world I am created',
            },
            begining_date: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-01T22:00:00.000Z',
            },
            ending_date: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-31T22:00:00.000Z',
            },
            trainings: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  example: "L'histoire de l'Afrique",
                },
                subtitle: {
                  type: 'string',
                  example: "L'histoire de l'afrique antique",
                },
                description: {
                  type: 'string',
                  example: 'who is ramses II',
                },
                trainingtype: {
                  type: 'string',
                  enum: [
                    'En ligne',
                    'Vision Conférence',
                    'En présentiel',
                    'Hybride',
                  ],
                  example: 'En présentiel',
                },
                prix: {
                  type: 'string',
                  example: '100.00',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Training session not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findOneForStudent(@Param('id', ParseUUIDPipe) id: string) {
    console.log(
      `🎓 [STUDENT TRAINING SESSION] Student requesting training session: ${id}`,
    );
    return this.trainingSessionService.findOneForStudent(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @TrainingSessionFindOneApiOperation()
  @TrainingSessionFindOneApiParam()
  @TrainingSessionFindOneApiResponse()
  @TrainingSessionNotFoundApiResponse()
  @TrainingSessionInternalServerErrorApiResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingSessionService.findOne(id);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @TrainingSessionUpdateApiOperation()
  @TrainingSessionUpdateApiBody()
  @TrainingSessionUpdateApiResponse()
  @TrainingSessionBadRequestApiResponse()
  @TrainingSessionNotFoundApiResponse()
  @TrainingSessionInternalServerErrorApiResponse()
  update(@Body() updateTrainingSessionDto: UpdateTrainingSessionDto) {
    return this.trainingSessionService.update(
      updateTrainingSessionDto.id,
      updateTrainingSessionDto,
    );
  }

  @Patch('update-payment')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @TrainingSessionUpdatePaymentApiOperation()
  @TrainingSessionUpdatePaymentApiBody()
  @TrainingSessionUpdatePaymentApiResponse()
  @TrainingSessionBadRequestApiResponse()
  @TrainingSessionNotFoundApiResponse()
  @TrainingSessionInternalServerErrorApiResponse()
  updatePayment(@Body() updatePaymentDto: UpdatePaymentDto) {
    return this.trainingSessionService.updatePayment(updatePaymentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @TrainingSessionDeleteApiOperation()
  @TrainingSessionDeleteApiParam()
  @TrainingSessionDeleteApiResponse()
  @TrainingSessionNotFoundApiResponse()
  @TrainingSessionInternalServerErrorApiResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingSessionService.remove(id);
  }
}
