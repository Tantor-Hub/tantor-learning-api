import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { User } from 'src/strategy/strategy.globaluser';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
  })
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @User() user: IJwtSignin,
  ) {
    return this.sessionsService.createSession(createSessionDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List of all sessions',
  })
  async findAll() {
    return this.sessionsService.getAllSessions();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Session details',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.getSessionById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateSessionDto })
  @ApiResponse({
    status: 200,
    description: 'Session updated successfully',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionsService.updateSession(id, updateSessionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Session deleted successfully',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.deleteSession(id);
  }
}
