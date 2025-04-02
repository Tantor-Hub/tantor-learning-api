import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-student.dto';
import { MailService } from 'src/services/service.mail';
import { AllSercices } from 'src/services/serices.all';
import { log } from 'console';
import { CryptoService } from 'src/services/service.crypto';
import { SignInStudentDto } from './dto/signin-student.dto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
        private readonly mailService: MailService,
        private readonly allServices: AllSercices,
        private readonly cryptoService: CryptoService
    ) { }

    @Get("list")
    async getAllUsers() {
        return this.userService.getAllUsers()
    }

    @Post('user/signup')
    async registerAsStudent(@Body() createUserDto: CreateUserDto) {
        return this.userService.registerAsStudent(createUserDto, this.mailService, this.allServices, this.cryptoService);
    }

    @Post("user/signin")
    async signinAsStudent(@Body() signInStudentDto: SignInStudentDto) {
        return this.userService.signInAsStudent(signInStudentDto, this.mailService, this.allServices, this.cryptoService)
    }
}
