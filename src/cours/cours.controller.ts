import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { UsersService } from 'src/users/users.service';
import { CoursService } from './cours.service';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { CreateCoursDto } from './dto/create-cours.dto';
import { UpdateCoursDto } from './dto/update-cours.dto';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { AssignFormateurToSessionDto } from 'src/sessions/dto/attribute-session.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('courses')
export class CoursController {
  constructor(
    private readonly usersService: UsersService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly coursService: CoursService,
  ) {}
  // @Get('course/:idcours')
  // @UseGuards(JwtAuthGuard)
  // async getCoursById(
  //   @User() user: IJwtSignin,
  //   @Param('idcours', ParseIntPipe) idcours: number,
  // ) {
  //   return this.coursService.getCoursById(idcours);
  // }

  // @Get('listall/:idSession')
  // @UseGuards(JwtAuthGuard)
  // async listDeTousLesCoursParSesson(
  //   @Param('idSession', ParseIntPipe) idSession: number,
  // ) {
  //   return this.coursService.getListCoursAllBySesson(idSession);
  // }
  // @Get('list')
  // @UseGuards(JwtAuthGuard)
  // async listDeTousLesCoursByConnectedUser(@User() user: IJwtSignin) {
  //   return this.coursService.getListCoursAllByFormateurConnected(user);
  // }
  // @Get('listallby/:byformateur/:idSession')
  // @UseGuards(JwtAuthGuard)
  // async listDeTousLesCoursParSessionAndFormateur(
  //   @Param('idSession', ParseIntPipe) idSession: number,
  //   @User() user: IJwtSignin,
  //   @Param('byformateur', ParseIntPipe) byformateur: number,
  // ) {
  //   return this.coursService.getListCoursAllBySessonAndByFormateur(
  //     idSession,
  //     byformateur,
  //     user,
  //   );
  // }
  @Get('getall')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description:
      'List of all courses with id_formateur as object, ordered by latest first',
    schema: {
      example: {
        status: 200,
        message: 'Success',
        data: {
          length: 2,
          rows: [
            {
              id: 2,
              id_formateur: {
                id: 3,
                fs_name: 'Jane',
                ls_name: 'Doe',
                email: 'jane.doe@example.com',
              },
              title: 'Advanced JavaScript',
              description: 'Advanced JavaScript concepts and best practices',
              is_published: false,
            },
            {
              id: 1,
              id_formateur: {
                id: 2,
                fs_name: 'John',
                ls_name: 'Smith',
                email: 'john.smith@example.com',
              },
              title: 'Introduction to Programming',
              description: 'Basic programming concepts and fundamentals',
              is_published: true,
            },
          ],
        },
      },
    },
  })
  async listDeTousLesCours() {
    return this.coursService.getListCoursAll();
  }
  // @Put('course/:idcours')
  // @UseGuards(JwtAuthGuardAsFormateur)
  // async addCoursAsFreeToLibrairies(
  //   @User() user: IJwtSignin,
  //   @Param('idcours', ParseIntPipe) idcours: number,
  // ) {
  //   return this.coursService.addCoursToLibrairie(idcours, user);
  // }
  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Create a new course for a session' })
  @ApiBody({
    type: CreateCoursDto,
    examples: {
      default: {
        summary: 'Create course example',
        value: {
          title: 'Introduction to Programming',
          description: 'Basic programming concepts and fundamentals',
          id_session: 1,
          id_formateurs: [1, 2],
          is_published: true,
        },
      },
      minimal: {
        summary: 'Minimal course creation',
        value: {
          title: 'Course Title',
          id_session: 1,
          id_formateurs: [1],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Course created successfully',
        data: {
          message: 'Course created successfully',
          preset_course: {
            id: 1,
            title: 'Course Title',
            description: 'Course Description',
            createdBy: 1,
          },
          created_courses: [
            {
              id: 1,
              id_formateur: 1,
              id_session: 1,
              is_published: false,
              duree: 120,
              ponderation: 1.5,
            },
          ],
          total_created: 1,
          total_requested: 1,
        },
      },
    },
  })
  async addCours(
    @User() user: IJwtSignin,
    @Body() createCoursDto: CreateCoursDto,
  ) {
    console.log(
      `[COURS CREATE] Starting course creation request by user ${user.id_user} (${user.uuid_user})`,
    );
    console.log(`[COURS CREATE] Course data:`, {
      title: createCoursDto.title,
      description: createCoursDto.description,
      id_session: createCoursDto.id_session,
      id_formateurs: createCoursDto.id_formateurs,
      is_published: createCoursDto.is_published,
    });

    try {
      const result = await this.coursService.createCourse(user, createCoursDto);
      console.log(
        `[COURS CREATE] ✅ Course creation successful! Created ${result.data?.total_created || 0} course(s) out of ${result.data?.total_requested || 0} requested.`,
      );
      console.log(`[COURS CREATE] Response:`, result);
      return result;
    } catch (error) {
      console.error(`[COURS CREATE] ❌ Course creation failed:`, error.message);
      console.error(`[COURS CREATE] Error details:`, error);
      throw error;
    }
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary:
      'Update course details including formateurs, title, and description (Secretary only)',
  })
  @ApiBody({
    type: UpdateCoursDto,
    description:
      'Course update data including formateurs, title, and description',
    examples: {
      default: {
        summary: 'Update course example',
        value: {
          title: 'Updated Course Title',
          description: 'Updated course description',
          id_formateurs: ['1', '2', '3'],
        },
      },
      minimal: {
        summary: 'Minimal course update',
        value: {
          title: 'Updated Course Title',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Course updated successfully',
        data: {
          id: 1,
          title: 'Updated Course Title',
          description: 'Updated course description',
          id_formateurs: [1, 2, 3],
        },
      },
    },
  })
  async updateCours(
    @User() user: IJwtSignin,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCoursDto: UpdateCoursDto,
  ) {
    return this.coursService.updateCours(user, id, updateCoursDto);
  }
  // @Put('course/assign')
  // @UseGuards(JwtAuthGuardAsManagerSystem)
  // async assignCours(
  //   @User() user: IJwtSignin,
  //   @Body() createCoursDto: AssignFormateurToSessionDto,
  // ) {
  //   return this.coursService.assignFormateurToSession(user, createCoursDto);
  // }
}
