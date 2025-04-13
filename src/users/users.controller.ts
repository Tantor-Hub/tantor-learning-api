import { Body, Controller, Get, Param, Post, Put, Req, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-student.dto';
import { SignInStudentDto } from './dto/signin-student.dto';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { GetUserByRoleDto } from 'src/roles/dto/get-users-byrole.dto';
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
import { log } from 'console';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    // # Auth routes for student 

    @Post('user/signup')
    async registerAsStudent(@Body() createUserDto: CreateUserDto) {
        return this.userService.registerAsStudent(createUserDto);
    }

    @Post("user/signin")
    async signinAsStudent(@Body() signInStudentDto: SignInStudentDto) {
        return this.userService.signInAsStudent(signInStudentDto)
    }

    @Put("user/verify")
    async verifyAsStudent(@Body() verifyAsStudentDto: VerifyAsStudentDto) {
        return this.userService.verifyAsStudent(verifyAsStudentDto)
    }

    @Put("user/refresh")
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.userService.refreshTokenUser(refreshTokenDto)
    }

    @Put("user/resendcode")
    async resentCodeAsStudent(@Body() resentCodeDto: ResentCodeDto) {
        log("You are here ==> ")
        return this.userService.resentVerificationCode(resentCodeDto)
    }

    @Put("user/forgotenpassword")
    async askForResetPassword(@Body() resentCodeDto: ResentCodeDto) {
        return this.userService.resentVerificationCode(resentCodeDto)
    }

    @Put("user/resetpassword")
    async setNewPassword(@Body() resentCodeDto: ResetPasswordDto) {
        return this.userService.setNewPassword(resentCodeDto)
    }

    @Get("user/profile")
    @UseGuards(JwtAuthGuardAsStudent)
    async profileAsStudent(@User() user) {
        return this.userService.profileAsStudent(user)
    }

    @Put("user/update")
    @UseGuards(JwtAuthGuardAsStudent)
    @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: 10_000_000 } }))
    async updateProfileAsStudent(@User() user: IJwtSignin, @Body() profile: any, @Request() req: Request) {
        return this.userService.updateUserProfile(user, profile, req)
    }

    @Get('user/authwithgoogle')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('/auth/google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any) {
        return this.userService.authWithGoogle(req.user)
    }

    // # Other routes

    @Get("user/:email")
    @UseGuards(JwtAuthGuardAsFormateur)
    async findByEmail(@Param() findByEmailDto: FindByEmailDto) {
        return this.userService.findByEmail(findByEmailDto,)
    }

    @Get("listall")
    @UseGuards(JwtAuthGuardAsFormateur)
    async getAllUsers() {
        return this.userService.getAllUsers()
    }

    // @Get("list/by/role:idrole")
    // async getAllUsersByRole() {
    //     return this.userService.getAllUsersByRole(@Body('idrole') getUserByRoleDto: GetUserByRoleDto)
    // }
}
