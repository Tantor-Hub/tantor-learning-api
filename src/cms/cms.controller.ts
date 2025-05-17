import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateAppInfosDto } from './dto/create-infos.dto';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { CreateContactDto } from './dto/contact-form.dto';
import { CreateMessageDto } from './dto/send-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from '../services/service.googledrive';

@Controller('cms')
export class CmsController {
    constructor(
        private readonly cmsService: CmsService,
        private readonly usersService: UsersService,
        private readonly googleDriveService: GoogleDriveService
    ) { }

    @Post('contactus')
    async onContactForm(@Body() form: CreateContactDto) {
        return this.cmsService.onContactForm(form)
    }

    @Get('messages/list')
    @UseGuards(JwtAuthGuard)
    async messagesListAll(@User() user) {
        return this.cmsService.getAllMessages(user)
    }

    @Put("messages/message/archive/:idmessage")
    @UseGuards(JwtAuthGuard)
    async onArchiveMessage(@User() user, @Param('idmessage', ParseIntPipe) idmessage: number) {
        return this.cmsService.archiveMessage(user, idmessage)
    }

    @Delete("messages/message/delete/:idmessage")
    @UseGuards(JwtAuthGuard)
    async onDeleteMessage(@User() user, @Param('idmessage', ParseIntPipe) idmessage: number) {
        return this.cmsService.deleteMessage(user, idmessage)
    }

    @Post('messages/message/send')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async sendMessage(@User() user, @Body() createMessageDto: CreateMessageDto, @UploadedFile() file: Express.Multer.File,) {
        let avatar: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                avatar = link
            }
        }
        return this.cmsService.sendMessage(user, { ...createMessageDto, piece_jointe: avatar })
    }

    @Get('messages/list/:groupe')
    @UseGuards(JwtAuthGuard)
    async messagesListAllByGroupe(@User() user, @Param('groupe') group: string) {
        return this.cmsService.getAllMessagesByGroupe(user, group)
    }

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
    async onLoadScores(@User() user: IJwtSignin) {
        return this.usersService.loadScores(user)
    }

    @Get('/dashboard/performances')
    @UseGuards(JwtAuthGuardAsStudent)
    async onLoadScoresPerformances(@User() user: IJwtSignin) {
        return this.usersService.loadPerformances(user)
    }
}
