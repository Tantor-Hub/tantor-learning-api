import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-student.dto';
import { SignInStudentDto } from './dto/signin-student.dto';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
    ) { }

    @Get("list")
    async getAllUsers() {
        return this.userService.getAllUsers()
    }

    @Post('user/signup')
    @UseGuards(JwtAuthGuardAsStudent)
    async registerAsStudent(@Body() createUserDto: CreateUserDto) {
        return this.userService.registerAsStudent(createUserDto);
    }

    @Post("user/signin")
    async signinAsStudent(@Body() signInStudentDto: SignInStudentDto) {
        return this.userService.signInAsStudent(signInStudentDto)
    }
}
