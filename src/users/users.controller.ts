import {
  Body,
  Controller,
  Get,
  Param,
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-student.dto';
import { SignInStudentDto } from './dto/signin-student.dto';
import { VerifyAsStudentDto } from './dto/verify-student.dto';
import { ResentCodeDto } from './dto/resent-code.dto';
import { FindByEmailDto } from './dto/find-by-email.dto';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { CreateUserMagicLinkDto } from './dto/create-user-withmagiclink.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { Response } from 'express';
import { log } from 'console';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post('user/signup')
  async registerAsStudent(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerAsStudent(createUserDto);
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
  @Post('user/signin')
  async signinAsStudent(@Body() signInStudentDto: SignInStudentDto) {
    return this.userService.signInAsStudent(signInStudentDto);
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
  @Put('user/resetpassword')
  async setNewPassword(@Body() resentCodeDto: ResetPasswordDto) {
    return this.userService.setNewPassword(resentCodeDto);
  }
  @Get('user/profile')
  @UseGuards(JwtAuthGuard)
  async profileAsStudent(@User() user) {
    return this.userService.profileAsStudent(user);
  }
  @Put('user/update')
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
  @Get('list/bygroup/:group')
  @UseGuards(JwtAuthGuardAsSuperviseur)
  async getAllUsersByRole(
    @Param('group')
    group: 'instructor' | 'teacher' | 'admin' | 'student' | 'secretary' | 'all',
  ) {
    if (![...Object.keys(this.userService.roleMap), 'all'].includes(group)) {
      return Responder({
        status: HttpStatusCode.BadRequest,
        data: `Invalid group: ${group}`,
      });
    }
    return this.userService.getAllUsersByRole(group);
  }
}
