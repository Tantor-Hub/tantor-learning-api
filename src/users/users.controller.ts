import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-student.dto';
import { SignInStudentDto } from './dto/signin-student.dto';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { GetUserByRoleDto } from 'src/roles/dto/get-users-byrole.dto';
import { VerifyAsStudentDto } from './dto/verify-student.dto';
import { ResentCodeDto } from './dto/resent-code.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    // # Auth routes for student 

    @Post('user/signup')
    // @UseGuards(JwtAuthGuardAsStudent)
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

    @Put("user/resendcode")
    async resentCodeAsStudent(@Body() resentCodeDto: ResentCodeDto) {
        return this.userService.resentVerificationCode(resentCodeDto)
    }

    // # Other routes

    @Get("listall")
    async getAllUsers() {
        return this.userService.getAllUsers()
    }

    
    // @Get("list/by/role:idrole")
    // async getAllUsersByRole() {
    //     return this.userService.getAllUsersByRole(@Body('idrole') getUserByRoleDto: GetUserByRoleDto)
    // }
}
