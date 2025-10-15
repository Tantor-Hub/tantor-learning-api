import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-student.dto';
import { VerifyAsStudentDto } from './dto/verify-student.dto';
import { ResentCodeDto } from './dto/resent-code.dto';
import { FindByEmailDto } from './dto/find-by-email.dto';
import { RegisterPasswordlessDto } from './dto/register-passwordless.dto';
import { LoginPasswordlessDto } from './dto/login-passwordless.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { CreateUserMagicLinkDto } from './dto/create-user-withmagiclink.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { Response } from 'express';
import { log } from 'console';
import { Users } from 'src/models/model.users';
import { UserRole, ALL_ROLES } from 'src/interface/interface.userrole';
import { IListUserByRoleResponse } from 'src/interface/interface.listuserbyroleresponse';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly googleDriveService: GoogleDriveService,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
  ) {}

  @Post('user/signup')
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        statuscode: { type: 'integer', example: 201 },
        status: { type: 'string', example: 'Success' },
        message: { type: 'string', example: 'User registered successfully' },
        data: { type: 'object' },
      },
    },
  })
  async registerAsStudent(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerAsStudent(createUserDto);
  }

  @Post('user/passwordless/register')
  async registerPasswordless(@Body() registerDto: RegisterPasswordlessDto) {
    return this.userService.registerPasswordless(registerDto);
  }

  @Post('user/passwordless/login')
  @ApiBody({ type: LoginPasswordlessDto })
  @ApiOperation({ summary: 'Login passwordless user with OTP' })
  @ApiResponse({
    status: 200,
    description: 'Successful login with OTP',
    schema: {
      type: 'object',
      properties: {
        statuscode: { type: 'integer', example: 200 },
        status: { type: 'string', example: 'Succès' },
        message: { type: 'string', example: 'OTP envoyé à votre email' },
      },
    },
  })
  async loginPasswordless(@Body() loginDto: LoginPasswordlessDto) {
    return this.userService.loginPasswordless(loginDto);
  }

  @Post('user/passwordless/verify')
  async verifyOtp(@Body() verifyDto: VerifyOtpDto) {
    return this.userService.verifyOtp(verifyDto);
  }
  @Post('user/add')
  @UseGuards(JwtAuthGuardAsFormateur)
  async addNewSystemeUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerAsNewUser(createUserDto);
  }
  @Get('user/me')
  @UseGuards(JwtAuthGuardAsFormateur)
  async GetSystemeUserStatusAsAuthOrNot() {
    return Responder({
      status: HttpStatusCode.Ok,
      data: { isTokenValid: true },
    });
  }
  @Post('user/add/magiclink')
  @UseGuards(JwtAuthGuardAsFormateur)
  async addNewSystemeUserSendMagicLink(
    @Body() createUserDto: CreateUserMagicLinkDto,
  ) {
    return this.userService.registerThanSendMagicLink(createUserDto);
  }
  @Post('user/register')
  async addNewSystemeUserViaMagicLink(
    @Body() createUserDto: CreateUserDto,
    @Query('email') email: string,
    @Query('verify') verify: string,
  ) {
    if (!email || !verify) {
      return Responder({
        status: HttpStatusCode.BadRequest,
        data: 'Email et token de vérification sont requis',
      });
    }
    return this.userService.registerAsNewUserFormMagicLink(
      createUserDto,
      email,
      verify,
    );
  }
  @Put('user/verify')
  async verifyAsStudent(@Body() verifyAsStudentDto: VerifyAsStudentDto) {
    return this.userService.verifyAsStudent(verifyAsStudentDto);
  }
  @Put('user/verify-before-reset-password')
  async verifyBeforeResetPassword(
    @Body() verifyAsStudentDto: VerifyAsStudentDto,
  ) {
    return this.userService.verifyBeforeResetPassword(verifyAsStudentDto);
  }
  @Put('user/refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userService.refreshTokenUser(refreshTokenDto);
  }
  @Put('user/resendcode')
  async resentCodeAsStudent(@Body() resentCodeDto: ResentCodeDto) {
    return this.userService.resentVerificationCode(resentCodeDto);
  }
  @Put('user/forgotenpassword')
  async askForResetPassword(@Body() resentCodeDto: ResentCodeDto) {
    return this.userService.resentVerificationCode(resentCodeDto);
  }
  @Get('user/profile')
  @UseGuards(JwtAuthGuard)
  async profileAsStudent(@User() user) {
    return this.userService.profileAsStudent(user);
  }
  @Patch('user/update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', { limits: { fileSize: 10_000_000 } }),
  )
  async updateProfileAsStudent(
    @User() user: IJwtSignin,
    @Body() profile: any,
    @Request() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let avatar: any = null;
    if (file) {
      const result = await this.googleDriveService.uploadBufferFile(file);
      if (result) {
        const { id, name, link } = result;
        avatar = link;
      }
    }
    return this.userService.updateUserProfile(
      user,
      { ...profile, as_avatar: avatar },
      req,
    );
  }
  @Get('user/authwithgoogle')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {}
  @Get('/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    log(' ===== >>>> ', req?.url);
    await this.userService.authWithGoogle(req.user, res);
  }
  @Get('user/:email')
  @UseGuards(JwtAuthGuardAsFormateur)
  async findByEmail(@Param() findByEmailDto: FindByEmailDto) {
    return this.userService.findByEmail(findByEmailDto);
  }
  @Get('listall')
  @UseGuards(JwtAuthGuardAsFormateur)
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getAllUsersAsSImplifiedList() {
    return this.userService.getAllUsersAsSimplifiedList();
  }
  @Get('byrole')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all users by specific role',
    description:
      'Retrieve users filtered by their role. Use query parameter ?role=<role> to filter users. Examples: GET /api/users/byrole?role=student, GET /api/users/byrole?role=admin, GET /api/users/byrole?role=all',
  })
  @ApiQuery({
    name: 'role',
    description: 'User role to filter by. Add as query parameter: ?role=<role>',
    enum: ALL_ROLES,
    example: UserRole.STUDENT,
    required: true,
    examples: {
      student: {
        summary: 'Get students',
        description: 'GET /api/users/byrole?role=student',
        value: 'student',
      },
      admin: {
        summary: 'Get admins',
        description: 'GET /api/users/byrole?role=admin',
        value: 'admin',
      },
      all: {
        summary: 'Get all users',
        description: 'GET /api/users/byrole?role=all',
        value: 'all',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Users retrieved successfully',
        data: [
          {
            id: 1,
            uuid: '550e8400-e29b-41d4-a716-446655440001',
            email: 'student1@example.com',
            fs_name: 'John',
            ls_name: 'Doe',
            role: 'student',
          },
          {
            id: 2,
            uuid: '550e8400-e29b-41d4-a716-446655440002',
            email: 'student2@example.com',
            fs_name: 'Jane',
            ls_name: 'Smith',
            role: 'student',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid role parameter',
    schema: {
      example: {
        status: 400,
        message:
          'Invalid role: teacher. Valid roles are: admin, student, instructor, secretary, all',
        data: [],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - insufficient permissions',
    schema: {
      example: {
        status: 401,
        message:
          "La clé d'authentification fournie n'a pas les droits recquis pour accéder à ces ressources",
      },
    },
  })
  async getUsersByRole(
    @Query('role') role: string,
  ): Promise<IListUserByRoleResponse> {
    console.log('=== getUsersByRole: Starting ===');
    console.log('Requested role:', role);
    console.log('Valid roles:', ALL_ROLES);

    if (!ALL_ROLES.includes(role)) {
      console.log('=== getUsersByRole: Invalid role ===');
      console.log('Role validation failed for:', role);
      return {
        status: HttpStatusCode.BadRequest,
        message: `Invalid role: ${role}. Valid roles are: ${ALL_ROLES.join(', ')}`,
        data: [],
      };
    }

    console.log('=== getUsersByRole: Calling service ===');
    console.log('Calling userService.getAllUsersByRole with role:', role);

    try {
      const result = await this.userService.getAllUsersByRole(role as any);
      console.log('=== getUsersByRole: Service response ===');
      console.log('Service result status:', result.status);
      console.log('Service result message:', result.message);
      console.log('Service result data type:', typeof result.data);
      console.log('Service result data:', result.data);
      console.log('Users count:', result.data?.list?.length || 0);

      const response = {
        status: result.status,
        message: result.message || 'Users retrieved successfully',
        data: result.data?.list || [],
      };

      console.log('=== getUsersByRole: Final response ===');
      console.log('Response status:', response.status);
      console.log('Response message:', response.message);
      console.log('Response data length:', response.data.length);

      return response;
    } catch (error) {
      console.error('=== getUsersByRole: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return {
        status: HttpStatusCode.InternalServerError,
        message: 'Internal server error while retrieving users by role',
        data: [],
      };
    }
  }

  @Patch('change-role')
  async changeUserRole(@Body() changeRoleDto: ChangeRoleDto) {
    return this.userService.changeRole(changeRoleDto);
  }

  @Patch('public/change-role')
  async publicChangeUserRole(@Body() changeRoleDto: ChangeRoleDto) {
    return this.userService.changeRole(changeRoleDto);
  }

  @Get('user-role')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserRole(@User() user: IJwtSignin) {
    // Fetch user roles from database using uuid
    const dbUser = await this.userService.getUserWithRoles(user.id_user);
    const userRoles = dbUser?.roles || [];

    return Responder({
      status: HttpStatusCode.Ok,
      data: {
        roles: userRoles,
        userId: user.id_user,
      },
    });
  }

  @Get('role/:email')
  @UseGuards(JwtAuthGuardAsFormateur)
  async getUserRoleByEmail(@Param('email') email: string) {
    return this.userService.getUserRoleByEmail(email);
  }
}
