import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateAppInfosDto } from './dto/create-infos.dto';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';

@Controller('cms')
export class CmsController {
    constructor(private readonly cmsService: CmsService, private readonly usersService: UsersService) { }

    @Get('infos')
    async onGetAppInfos() {
        return this.cmsService.onGetAppInfos()
    }

    @Post('infos/add')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async onAddInfosData(@Body() createAppInfosDto: CreateAppInfosDto) {
        return this.cmsService.onAddAppInfos(createAppInfosDto)
    }

    @Get('dashboard/cards')
    @UseGuards(JwtAuthGuardAsStudent)
    async onLoadStudentDashboard(@User() user: IJwtSignin) {
        return this.usersService.loadStudentDashboard(user)
    }

    @Get('dashboard/nextlivessessions')
    @UseGuards(JwtAuthGuardAsStudent)
    async onLoadNextLivesSessions(@User() user: IJwtSignin) {
        return this.usersService.loadStudentNextLiveSession(user)
    }

    @Get('/dashboard/averages')
    @UseGuards(JwtAuthGuardAsStudent)
    async onLoadScores(@User() user: IJwtSignin){
        return this.usersService.loadScores(user)
    }

    @Get('/dashboard/performances')
    @UseGuards(JwtAuthGuardAsStudent)
    async onLoadScoresPerformances(@User() user: IJwtSignin){
        return this.usersService.loadPerformances(user)
    }

    @Get('/messages/list')
    @UseGuards(JwtAuthGuard)
    async onMessages(@User() user: IJwtSignin){
        
        // return this.cmsService.loadPerformances(user)
    }
}
