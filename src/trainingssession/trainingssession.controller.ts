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
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
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

  @Get(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
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
