import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-student.dto';
import { MailService } from 'src/services/service.mail';
import { AllSercices } from 'src/services/serices.all';
import { log } from 'console';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
        private mailService: MailService,
        private allServices: AllSercices
    ) { }

    @Get("list")
    async getAllUsers() {
        return this.userService.getAllUsers()
    }

    @Post('user/signup')
    async registerAsStudent(@Body() createUserDto: CreateUserDto) {
        log("We are over here David Maene == >", createUserDto)
        return this.userService.registerAsStudent(createUserDto);
    }
}
