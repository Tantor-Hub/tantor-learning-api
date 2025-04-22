import { Controller, Get, Post } from '@nestjs/common';

@Controller('sessions')
export class SessionsController {

    @Get('list')
    async getListSessions() {

    }

    @Post('session/add')
    async addNewSession() {

    }
}
