import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { User } from 'src/strategy/strategy.globaluser';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { EventSwagger } from './swagger.event';

@ApiTags('Events')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create-for-course/:courseId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.createForCourse)
  @ApiParam(EventSwagger.createForCourse.param)
  @ApiBody(EventSwagger.createForCourse.body)
  @ApiResponse(EventSwagger.createForCourse.responses[201])
  @ApiResponse(EventSwagger.createForCourse.responses[400])
  @ApiResponse(EventSwagger.createForCourse.responses[401])
  @ApiResponse(EventSwagger.createForCourse.responses[403])
  @ApiResponse(EventSwagger.createForCourse.responses[404])
  createForCourse(
    @Param('courseId') courseId: string,
    @Body()
    createEventDto: Omit<CreateEventDto, 'id_cible_cours' | 'createdBy'>,
    @User() user: IJwtSignin,
  ) {
    const eventData = {
      ...createEventDto,
      id_cible_cours: courseId,
      createdBy: user.id_user,
    };
    return this.eventService.create(eventData);
  }

  @Post('create-for-session/:sessionId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.createForSession)
  @ApiParam(EventSwagger.createForSession.param)
  @ApiBody(EventSwagger.createForSession.body)
  @ApiResponse(EventSwagger.createForSession.responses[201])
  @ApiResponse(EventSwagger.createForSession.responses[400])
  @ApiResponse(EventSwagger.createForSession.responses[401])
  @ApiResponse(EventSwagger.createForSession.responses[403])
  @ApiResponse(EventSwagger.createForSession.responses[404])
  createForSession(
    @Param('sessionId') sessionId: string,
    @Body() createEventDto: Omit<CreateEventDto, 'id_cible_session'>,
  ) {
    const eventData = {
      ...createEventDto,
      id_cible_session: sessionId,
    };
    return this.eventService.create(eventData);
  }

  @Post('create-for-lesson/:lessonId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.createForLesson)
  @ApiParam(EventSwagger.createForLesson.param)
  @ApiBody(EventSwagger.createForLesson.body)
  @ApiResponse(EventSwagger.createForLesson.responses[201])
  @ApiResponse(EventSwagger.createForLesson.responses[400])
  @ApiResponse(EventSwagger.createForLesson.responses[401])
  @ApiResponse(EventSwagger.createForLesson.responses[403])
  @ApiResponse(EventSwagger.createForLesson.responses[404])
  createForLesson(
    @Param('lessonId') lessonId: string,
    @Body() createEventDto: Omit<CreateEventDto, 'id_cible_lesson'>,
  ) {
    const eventData = {
      ...createEventDto,
      id_cible_lesson: [lessonId],
    };
    return this.eventService.create(eventData);
  }

  @Post('create-for-user/:userId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.createForUser)
  @ApiParam(EventSwagger.createForUser.param)
  @ApiBody(EventSwagger.createForUser.body)
  @ApiResponse(EventSwagger.createForUser.responses[201])
  @ApiResponse(EventSwagger.createForUser.responses[400])
  @ApiResponse(EventSwagger.createForUser.responses[401])
  @ApiResponse(EventSwagger.createForUser.responses[403])
  @ApiResponse(EventSwagger.createForUser.responses[404])
  createForUser(
    @Param('userId') userId: string,
    @Body() createEventDto: Omit<CreateEventDto, 'id_cible_user'>,
  ) {
    const eventData = {
      ...createEventDto,
      id_cible_user: [userId], // Note: id_cible_user is an array
    };
    return this.eventService.create(eventData);
  }

  @Get('getall')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.findAll)
  @ApiResponse(EventSwagger.findAll.responses[200])
  @ApiResponse(EventSwagger.findAll.responses[401])
  findAll() {
    return this.eventService.findAll();
  }

  @Get('training/:trainingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.findByTraining)
  @ApiParam(EventSwagger.findByTraining.param)
  @ApiResponse(EventSwagger.findByTraining.responses[200])
  @ApiResponse(EventSwagger.findByTraining.responses[401])
  @ApiResponse(EventSwagger.findByTraining.responses[404])
  findByTraining(@Param('trainingId') trainingId: string) {
    return this.eventService.findByTraining(trainingId);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation(EventSwagger.findBySession)
  @ApiParam(EventSwagger.findBySession.param)
  @ApiResponse(EventSwagger.findBySession.responses[200])
  @ApiResponse(EventSwagger.findBySession.responses[401])
  @ApiResponse(EventSwagger.findBySession.responses[404])
  findBySession(@Param('sessionId') sessionId: string) {
    return this.eventService.findBySession(sessionId);
  }

  @Get('student/session/:sessionId')
  @UseGuards(JwtAuthGuardAsStudentInSession)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.findBySessionForStudent)
  @ApiParam(EventSwagger.findBySessionForStudent.param)
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[200])
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[403])
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[401])
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[404])
  @ApiResponse(EventSwagger.findBySessionForStudent.responses[500])
  findBySessionForStudent(@Param('sessionId') sessionId: string) {
    return this.eventService.findBySessionForStudent(sessionId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.findByUser)
  @ApiResponse(EventSwagger.findByUser.responses[200])
  @ApiResponse(EventSwagger.findByUser.responses[401])
  @ApiResponse(EventSwagger.findByUser.responses[404])
  findByUser(@User() user: IJwtSignin) {
    return this.eventService.findByUser(user.id_user);
  }

  @Get('date-range')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.findByDateRange)
  @ApiQuery(EventSwagger.findByDateRange.queries.startDate)
  @ApiQuery(EventSwagger.findByDateRange.queries.endDate)
  @ApiResponse(EventSwagger.findByDateRange.responses[200])
  @ApiResponse(EventSwagger.findByDateRange.responses[401])
  @ApiResponse(EventSwagger.findByDateRange.responses[400])
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.eventService.findByDateRange(startDate, endDate);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.findOne)
  @ApiParam(EventSwagger.findOne.param)
  @ApiResponse(EventSwagger.findOne.responses[200])
  @ApiResponse(EventSwagger.findOne.responses[401])
  @ApiResponse(EventSwagger.findOne.responses[404])
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.update)
  @ApiParam(EventSwagger.update.param)
  @ApiBody(EventSwagger.update.body)
  @ApiResponse(EventSwagger.update.responses[200])
  @ApiResponse(EventSwagger.update.responses[400])
  @ApiResponse(EventSwagger.update.responses[401])
  @ApiResponse(EventSwagger.update.responses[403])
  @ApiResponse(EventSwagger.update.responses[404])
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    console.log('=== Event Controller Update Debug ===');
    console.log('Controller received id:', id, 'Type:', typeof id);
    console.log('Controller received body:', updateEventDto);
    return this.eventService.update(id, updateEventDto);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.findBySession)
  @ApiParam(EventSwagger.findBySession.param)
  @ApiResponse(EventSwagger.findBySession.responses[200])
  @ApiResponse(EventSwagger.findBySession.responses[401])
  @ApiResponse(EventSwagger.findBySession.responses[404])
  getEventsBySession(@Param('sessionId') sessionId: string) {
    return this.eventService.findBySession(sessionId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.remove)
  @ApiParam(EventSwagger.remove.param)
  @ApiResponse(EventSwagger.remove.responses[200])
  @ApiResponse(EventSwagger.remove.responses[401])
  @ApiResponse(EventSwagger.remove.responses[403])
  @ApiResponse(EventSwagger.remove.responses[404])
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }

  @Get('instructor/mycourses')
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @ApiBearerAuth()
  @ApiOperation(EventSwagger.getEventsForInstructorCourses)
  @ApiResponse(EventSwagger.getEventsForInstructorCourses.responses[200])
  @ApiResponse(EventSwagger.getEventsForInstructorCourses.responses[401])
  @ApiResponse(EventSwagger.getEventsForInstructorCourses.responses[403])
  @ApiResponse(EventSwagger.getEventsForInstructorCourses.responses[500])
  async getEventsForInstructorCourses(@User() user: IJwtSignin) {
    return this.eventService.findByInstructorCourses(user);
  }
}
