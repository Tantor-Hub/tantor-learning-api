import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-student.dto';
import { SignInStudentDto } from './dto/signin-student.dto';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { GetUserByRoleDto } from 'src/roles/dto/get-users-byrole.dto';

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
