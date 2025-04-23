import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { User } from 'src/strategy/strategy.globaluser';

@Controller('sessions')
export class SessionsController {

    constructor(
        private readonly googleDriveService: GoogleDriveService,
        private readonly sessionsService: SessionsService
    ) { }

    @Post('session/apply')
    @UseGuards(JwtAuthGuardAsStudent)
    async applyToSession(@User() user) {
        return this.sessionsService.listAllSession()
    }

    @Get('list')
    async getAllSessions() {
        return this.sessionsService.listAllSession()
    }

    @Delete('session/:idSession')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async deleteSession(@Param('idSession', ParseIntPipe) idSession: number,) {
        return this.sessionsService.deleteSession(idSession)
    }

    @Put('session/:idSession')
    @UseGuards(JwtAuthGuardAsFormateur)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async updateSession(@Body() UpdateSessionDto, @Param('idSession', ParseIntPipe) idSession: number, @UploadedFile() file: Express.Multer.File,) {
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            const { id, name, link, } = result
            piece_jointe = link
        }
        return this.sessionsService.updateSession({ ...UpdateSessionDto, piece_jointe }, idSession)
    }

    @Post('session/add')
    @UseGuards(JwtAuthGuardAsFormateur)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async addNewSession(@Body() createSessionDto: CreateSessionDto, @UploadedFile() file: Express.Multer.File,) {
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            const { id, name, link, } = result
            piece_jointe = link
        }
        return this.sessionsService.createSession({ ...createSessionDto, piece_jointe })
    }

    @Get('list/bythematic/:idThematic')
    async getAllFormationsByThematic(@Param('idThematic', ParseIntPipe) idThematic: number) {
        return this.sessionsService.gatAllSessionsByThematic(idThematic)
    }

    @Get('list/bycategory/:idCategory')
    async getAllFormationsByCategory(@Param('idCategory', ParseIntPipe) idCategory: number) {
        return this.sessionsService.gatAllSessionsByCategory(idCategory)
    }

    @Get('list/by/:idThematic/:idCategory')
    async getAllFormationsByThematicAndCategory(@Param('idCategory', ParseIntPipe) idCategory: number, @Param('idThematic', ParseIntPipe) idThematic: number) {
        return this.sessionsService.gatAllSessionsByThematicAndCategory(idThematic, idCategory)
    }
}
