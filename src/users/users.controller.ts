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
import { SetVerifiedStatusDto } from './dto/set-verified-status.dto';
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
import { AssignMultipleRolesDto } from './dto/assign-multiple-roles.dto';
import { AddRoleDto } from './dto/add-role.dto';
import { RemoveRoleDto } from './dto/remove-role.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import {
  JwtAuthGuardAdminOrSecretary,
  JwtAuthGuardSecretaryAndInstructor,
  JwtAuthGuardAdminAndSecretary,
} from 'src/guard/guard.multi-role';
import { MultiRole } from 'src/guard/decorators/multi-role.decorator';
import { Response } from 'express';
import { log } from 'console';
import { Users } from 'src/models/model.users';
import { UserRole, ALL_ROLES } from 'src/interface/interface.userrole';
import { IListUserByRoleResponse } from 'src/interface/interface.listuserbyroleresponse';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
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
  @ApiBody({ type: VerifyOtpDto })
  @ApiOperation({ summary: 'Verify OTP code', description: 'Verify the OTP code sent to user email for passwordless authentication' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully. User authenticated.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 200 },
        message: { type: 'string', example: 'Succès' },
        data: {
          type: 'object',
          properties: {
            auth_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                email: { type: 'string', example: 'john.doe@example.com' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                avatar: { type: 'string', example: 'https://example.com/avatar.jpg', nullable: true },
                role: { type: 'string', example: 'STUDENT' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP code',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 400 },
        message: { type: 'string', example: 'Requête invalide' },
        data: { type: 'string', example: 'OTP invalide' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'User account is not verified',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 403 },
        message: { type: 'string', example: 'Accès interdit' },
        data: { type: 'string', example: "Votre compte n'est pas vérifié. Veuillez contacter un administrateur." },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 404 },
        message: { type: 'string', example: 'Ressource introuvable' },
        data: { type: 'string', example: 'Utilisateur non trouvé' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'integer', example: 500 },
        message: { type: 'string', example: 'Erreur interne du serveur' },
        data: { type: 'object' },
      },
    },
  })
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

  @Post('auth/refresh')
  async refreshTokenPost(@Body() refreshTokenDto: RefreshTokenDto) {
    console.log(
      '[USERS CONTROLLER] 🔄 Refresh token POST request:',
      refreshTokenDto,
    );
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
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Allows authenticated users to update their own profile information including personal details and profile picture (avatar).',
  })
  @ApiBody({
    type: UpdateUserProfileDto,
    description: 'User profile update data',
    examples: {
      updateProfile: {
        summary: 'Update user profile',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'Paris',
          country: 'France',
          dateBirth: '1990-01-01',
          num_piece_identite: 'ID123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Success' },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: { type: 'string', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            avatar: {
              type: 'string',
              nullable: true,
              example: 'https://drive.google.com/file/d/...',
            },
            role: { type: 'string', example: 'student' },
            phone: { type: 'string', nullable: true, example: '+1234567890' },
            address: { type: 'string', nullable: true, example: '123 Main St' },
            city: { type: 'string', nullable: true, example: 'Paris' },
            country: { type: 'string', nullable: true, example: 'France' },
            dateBirth: {
              type: 'string',
              nullable: true,
              example: '1990-01-01',
            },
            num_piece_identite: {
              type: 'string',
              nullable: true,
              example: 'ID123456',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Bad Request' },
        data: {
          type: 'string',
          example: 'Le body de la requete ne peut etre vide',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Not Found' },
        data: { type: 'null', example: null },
      },
    },
  })
  async updateProfileAsStudent(
    @User() user: IJwtSignin,
    @Body() profile: UpdateUserProfileDto,
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
  @ApiOperation({
    summary: 'Google OAuth Callback',
    description: `
# Google OAuth Authentication Callback

This endpoint is automatically called by Google OAuth after the user completes authentication on Google's servers. **This endpoint should NOT be called directly by the frontend.**

## How It Works

1. User initiates login by visiting: \`GET /api/users/user/authwithgoogle\`
2. User is redirected to Google for authentication
3. After Google authentication, Google redirects back to this callback endpoint
4. This endpoint processes the authentication and redirects to the frontend

## Frontend Integration

### Success Response
On successful authentication, the user is redirected to:
\`\`\`
{APPBASEURLFRONT}/signin?success={base64_encoded_json}
\`\`\`

The \`success\` query parameter contains a base64-encoded JSON object:
\`\`\`json
{
  "status": 200,
  "message": "Succès",
  "data": {
    "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg",
      "role": "STUDENT"
    }
  }
}
\`\`\`

### Error Response
On authentication failure, the user is redirected to:
\`\`\`
{APPBASEURLFRONT}/signin?error={base64_encoded_json}
\`\`\`

The \`error\` query parameter contains a base64-encoded JSON object:
\`\`\`json
{
  "code": 500,
  "message": "Error message",
  "data": "Error details"
}
\`\`\`

## Frontend Implementation Example

\`\`\`typescript
// In your signin page component
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const error = urlParams.get('error');

  if (success) {
    try {
      const decoded = JSON.parse(atob(success));
      if (decoded.status === 200 && decoded.data) {
        // Store tokens
        localStorage.setItem('auth_token', decoded.data.auth_token);
        localStorage.setItem('refresh_token', decoded.data.refresh_token);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(decoded.data.user));
        
        // Redirect to dashboard or home
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Failed to parse success response:', err);
    }
  }

  if (error) {
    try {
      const decoded = JSON.parse(atob(error));
      // Display error message to user
      showErrorToast(decoded.message || 'Authentication failed');
    } catch (err) {
      console.error('Failed to parse error response:', err);
    }
  }
}, []);
\`\`\`

## Notes

- The redirect URL is configured in the Google OAuth strategy
- New users are automatically created with the STUDENT role
- Existing users are logged in directly
- All user data comes from the Google profile (email, name, avatar)
    `,
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend signin page with success or error query parameters',
    headers: {
      Location: {
        description: 'Redirect URL to frontend signin page',
        schema: {
          type: 'string',
          example: 'http://localhost:3000/signin?success=eyJzdGF0dXMiOjIwMCwibWVzc2FnZSI6IlN1Y2PDqHMiLCJkYXRhIjp7ImF1dGhfdG9rZW4iOiIuLi4iLCJyZWZyZXNoX3Rva2VuIjoiLi4uIiwidXNlciI6eyJpZCI6Ii4uLiIsImVtYWlsIjoiLi4uIn19fQ==',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during authentication',
  })
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
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiOperation({
    summary: 'Change user role (Admin only)',
    description:
      'Change the role of a user. Only admins can perform this action.',
  })
  @ApiBody({
    type: ChangeRoleDto,
    description: 'User email and new role',
    examples: {
      changeToAdmin: {
        summary: 'Change user to admin',
        value: {
          email: 'user@example.com',
          role: 'admin',
        },
      },
      changeToInstructor: {
        summary: 'Change user to instructor',
        value: {
          email: 'user@example.com',
          role: 'instructor',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User role changed successfully',
    schema: {
      example: {
        status: 200,
        message:
          "Rôle de l'utilisateur user@example.com changé avec succès à admin",
        data: "Rôle de l'utilisateur user@example.com changé avec succès à admin",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid role or email',
    schema: {
      example: {
        status: 400,
        message: 'Rôle invalide: invalid_role',
        data: 'Rôle invalide: invalid_role',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        status: 404,
        message: "Utilisateur avec l'email user@example.com non trouvé",
        data: "Utilisateur avec l'email user@example.com non trouvé",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
    schema: {
      example: {
        status: 401,
        message:
          "La clé d'authentification fournie n'a pas les droits recquis pour accéder à ces ressources",
      },
    },
  })
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

  // Example endpoints demonstrating multi-role guards

  @Get('admin-or-secretary-only')
  @UseGuards(JwtAuthGuardAdminOrSecretary)
  @ApiOperation({
    summary: 'Admin or Secretary only endpoint',
    description:
      'This endpoint can be accessed by users who have either admin OR secretary role',
  })
  @ApiResponse({
    status: 200,
    description: 'Access granted - user has admin or secretary role',
  })
  async adminOrSecretaryOnly() {
    return Responder({
      status: HttpStatusCode.Ok,
      data: 'Access granted: You have admin or secretary role',
    });
  }

  @Get('secretary-and-instructor-only')
  @UseGuards(JwtAuthGuardSecretaryAndInstructor)
  @ApiOperation({
    summary: 'Secretary AND Instructor only endpoint',
    description:
      'This endpoint can only be accessed by users who have BOTH secretary AND instructor roles',
  })
  @ApiResponse({
    status: 200,
    description:
      'Access granted - user has both secretary and instructor roles',
  })
  async secretaryAndInstructorOnly() {
    return Responder({
      status: HttpStatusCode.Ok,
      data: 'Access granted: You have both secretary and instructor roles',
    });
  }

  @Get('admin-and-secretary-only')
  @UseGuards(JwtAuthGuardAdminAndSecretary)
  @ApiOperation({
    summary: 'Admin AND Secretary only endpoint',
    description:
      'This endpoint can only be accessed by users who have BOTH admin AND secretary roles',
  })
  @ApiResponse({
    status: 200,
    description: 'Access granted - user has both admin and secretary roles',
  })
  async adminAndSecretaryOnly() {
    return Responder({
      status: HttpStatusCode.Ok,
      data: 'Access granted: You have both admin and secretary roles',
    });
  }

  @Get('custom-multi-role')
  @UseGuards(JwtAuthGuardAdminOrSecretary) // Using decorator approach
  @MultiRole({
    requiredRoles: ['instructor', 'secretary'],
    requireAll: false, // User needs instructor OR secretary
    allowAdminOverride: true, // Admin can always access
  })
  @ApiOperation({
    summary: 'Custom multi-role endpoint',
    description:
      'This endpoint demonstrates custom multi-role configuration using decorator',
  })
  @ApiResponse({
    status: 200,
    description: 'Access granted based on custom role requirements',
  })
  async customMultiRole() {
    return Responder({
      status: HttpStatusCode.Ok,
      data: 'Access granted: You meet the custom role requirements',
    });
  }

  @Get('admin/user/:userId/login-count')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiOperation({
    summary: 'Get user login count in past 7 days (Admin only)',
    description:
      'Get the number of times a user has logged in during the past 7 days. Only admins can access this endpoint.',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Login count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 200,
          description: 'HTTP status code',
        },
        message: {
          type: 'string',
          example: 'Success',
          description: 'Response message',
        },
        data: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
              description: 'User ID',
            },
            loginCount: {
              type: 'number',
              example: 5,
              description: 'Total number of logins in the past 7 days',
            },
            period: {
              type: 'string',
              example: '7 days',
              description: 'Time period for the data',
            },
          },
          required: ['userId', 'loginCount', 'period'],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 500,
        },
        data: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Erreur lors de la récupération du nombre de connexions',
            },
          },
        },
      },
    },
  })
  async getUserLoginCount(@Param('userId') userId: string) {
    return this.userService.getUserLoginCount(userId);
  }

  @Get('admin/daily-logins')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiOperation({
    summary: 'Get daily login counts for all users - past 7 days (Admin only)',
    description:
      'Get the aggregated number of logins per day for all users in the past 7 days, formatted for graph visualization. Only admins can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily login counts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 200,
          description: 'HTTP status code',
        },
        message: {
          type: 'string',
          example: 'Success',
          description: 'Response message',
        },
        data: {
          type: 'object',
          properties: {
            dailyLogins: {
              type: 'array',
              description:
                'Array of daily login counts (aggregated across all users) for the past 7 days',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string',
                    format: 'date',
                    example: '2025-01-30',
                    description: 'Date in YYYY-MM-DD format',
                  },
                  count: {
                    type: 'number',
                    example: 15,
                    description:
                      'Total number of logins from all users on this date',
                  },
                },
                required: ['date', 'count'],
              },
              example: [
                { date: '2025-01-24', count: 12 },
                { date: '2025-01-25', count: 8 },
                { date: '2025-01-26', count: 5 },
                { date: '2025-01-27', count: 20 },
                { date: '2025-01-28', count: 15 },
                { date: '2025-01-29', count: 10 },
                { date: '2025-01-30', count: 18 },
              ],
            },
            period: {
              type: 'string',
              example: '7 days',
              description: 'Time period for the data',
            },
            totalLogins: {
              type: 'number',
              example: 88,
              description:
                'Total number of logins from all users in the past 7 days',
            },
          },
          required: ['dailyLogins', 'period', 'totalLogins'],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 500,
        },
        data: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example:
                'Erreur lors de la récupération des connexions quotidiennes',
            },
          },
        },
      },
    },
  })
  async getAllUsersDailyLoginCount() {
    return this.userService.getAllUsersDailyLoginCount();
  }

  @Patch('admin/user/verification-status')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiOperation({
    summary: 'Set user verification status (Admin only)',
    description:
      'Update the is_verified status of a user. Setting to false will prevent the user from logging in. Only admins can access this endpoint.',
  })
  @ApiBody({
    type: SetVerifiedStatusDto,
    description: 'User ID and verification status',
    examples: {
      revokeVerification: {
        summary: 'Revoke user verification',
        value: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          is_verified: false,
        },
      },
      grantVerification: {
        summary: 'Grant user verification',
        value: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          is_verified: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification status updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Success',
        },
        data: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
            is_verified: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: "Vérification de l'utilisateur révoquée",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async setUserVerifiedStatus(
    @Body() setVerifiedStatusDto: SetVerifiedStatusDto,
  ) {
    return this.userService.setUserVerifiedStatus(
      setVerifiedStatusDto.userId,
      setVerifiedStatusDto.is_verified,
    );
  }

  @Patch('admin/user/:userId/toggle-verification')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiOperation({
    summary: 'Toggle user verification status (Admin only)',
    description:
      'Toggle the is_verified status of a user. If true, sets it to false; if false, sets it to true. This endpoint automatically changes the verification status. Only admins can access this endpoint.',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Success',
        },
        data: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
            previousStatus: {
              type: 'boolean',
              example: true,
              description: 'Previous is_verified status',
            },
            newStatus: {
              type: 'boolean',
              example: false,
              description: 'New is_verified status after toggle',
            },
            message: {
              type: 'string',
              example: "Vérification de l'utilisateur révoquée",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async toggleUserVerifiedStatus(@Param('userId') userId: string) {
    return this.userService.toggleUserVerifiedStatus(userId);
  }

  @Get('admin/user/:userId/profile')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiOperation({
    summary: 'Get user profile by ID (Admin only)',
    description:
      'Retrieve the profile information of any user by their ID. Only admins can access this endpoint. Sensitive fields like verification_code, is_verified, and last_login are excluded from the response.',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user to retrieve profile for',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Success',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            avatar: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/avatar.jpg',
            },
            role: {
              type: 'string',
              example: 'student',
            },
            phone: {
              type: 'string',
              nullable: true,
              example: '+1234567890',
            },
            address: {
              type: 'string',
              nullable: true,
              example: '123 Main St',
            },
            city: {
              type: 'string',
              nullable: true,
              example: 'Paris',
            },
            country: {
              type: 'string',
              nullable: true,
              example: 'France',
            },
            dateBirth: {
              type: 'string',
              nullable: true,
              example: '1990-01-01',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 404,
        },
        message: {
          type: 'string',
          example: 'Not Found',
        },
        data: {
          type: 'null',
          example: null,
        },
      },
    },
  })
  async getUserProfileById(@Param('userId') userId: string) {
    return this.userService.getUserProfileById(userId);
  }
}
