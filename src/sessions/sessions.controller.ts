import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { User } from 'src/strategy/strategy.globaluser';
import { MediasoupService } from '../services/service.mediasoup';
import { ApplySessionDto } from './dto/apply-tosesssion.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AddSeanceSessionDto } from './dto/add-seances.dto';
import { AddHomeworkSessionDto } from './dto/add-homework.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { AssignFormateurToSessionDto } from './dto/attribute-session.dto';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { CreatePaymentSessionDto } from './dto/payement-methode.dto';
import { DOCUMENT_KEYS, UploadDocumentToSessionDto } from './dto/add-document-session.dto';
import { DOCUMENT_KEYS_PHASES } from 'src/utils/utiles.documentskeyenum';
import { log } from 'node:console';

@Controller('sessions')
export class SessionsController {

    constructor(
        private readonly googleDriveService: GoogleDriveService,
        private readonly sessionsService: SessionsService,
        private readonly mediasoupService: MediasoupService
    ) { }

    @Put('session/document/before')
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    @UseGuards(JwtAuthGuardAsStudent)
    async submitDocBefore(@Body() payementSessionDto: UploadDocumentToSessionDto, @User() user: IJwtSignin, @UploadedFile() file: Express.Multer.File) {
        const document = DocumentType[payementSessionDto['key_document']];
        log(payementSessionDto['key_document'], DOCUMENT_KEYS, document)
        if (!DOCUMENT_KEYS_PHASES.avant_formation.includes(payementSessionDto['key_document'])) return Responder({ status: HttpStatusCode.BadRequest, data: `Le ${document} document envoyé n'est pas autorisé pour cette phase de la formation. ${DOCUMENT_KEYS_PHASES.avant_formation.join(",")}` })
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                piece_jointe = link
            }
        }
        return this.sessionsService.uploadDocumentToSessionDTO(user, { ...payementSessionDto, piece_jointe, document });
    }
    @Put('session/document/during')
    @UseGuards(JwtAuthGuardAsStudent)
    async submitDocDuring(@Body() payementSessionDto: UploadDocumentToSessionDto, @User() user: IJwtSignin, @UploadedFile() file: Express.Multer.File) {
        if (!DOCUMENT_KEYS_PHASES.pendant_formation.includes(payementSessionDto.key_document)) return Responder({ status: HttpStatusCode.BadRequest, data: "Le document envoyé n'est pas autorisé pour cette phase de la formation." })
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                piece_jointe = link
            }
        }
        return this.sessionsService.uploadDocumentToSessionDTO(user, { ...payementSessionDto, piece_jointe, document: DOCUMENT_KEYS[payementSessionDto['key_document']] });
    }
    @Put('session/document/after')
    @UseGuards(JwtAuthGuardAsStudent)
    async submitDocAfter(@Body() payementSessionDto: UploadDocumentToSessionDto, @User() user: IJwtSignin, @UploadedFile() file: Express.Multer.File) {
        if (!DOCUMENT_KEYS_PHASES.apres_formation.includes(payementSessionDto.key_document)) return Responder({ status: HttpStatusCode.BadRequest, data: "Le document envoyé n'est pas autorisé pour cette phase de la formation." })
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                piece_jointe = link
            }
        }
        return this.sessionsService.uploadDocumentToSessionDTO(user, { ...payementSessionDto, piece_jointe, document: DOCUMENT_KEYS[payementSessionDto['key_document']] });
    }
    @Put('session/payement')
    @UseGuards(JwtAuthGuardAsStudent)
    async payementSession(@Body() payementSessionDto: CreatePaymentSessionDto, @User() user: IJwtSignin) {
        return this.sessionsService.payementSession(user, payementSessionDto);
    }
    @Get('byidformation/:idformation')
    async getAllSessionByIdFormation(@Param("idformation", ParseIntPipe) idformation: number) {
        return this.sessionsService.getAllSessionByIdFormation(idformation)
    }
    @Get("session/documents/:idstudent/:idsession/:group")
    @UseGuards(JwtAuthGuard)
    async getDocumentsList(
        @Param('group') group: 'after' | 'during' | 'after',
        @Param("idstudent", ParseIntPipe) idstudent: number,
        @Param("idsession", ParseIntPipe) idsession: number
    ) {
        return this.sessionsService.GetDocumentsByGroup(idsession, idstudent, group)
    }
    @Get('session/:idsession')
    // @UseGuards(JwtAuthGuard)
    async getSessionById(@Param("idsession", ParseIntPipe) idsession: number) {
        return this.sessionsService.getSessionById(idsession)
    }
    @Get('students/list/:idsession')
    @UseGuards(JwtAuthGuardAsFormateur)
    async listeDesApprenantsParIdSession(@Param("idsession", ParseIntPipe) idsession: number) {
        return this.sessionsService.listOfLearnerByIdSession(idsession)
    }
    @Get('students/list')
    @UseGuards(JwtAuthGuardAsFormateur)
    async listeDesApprenantsOnAllSessions(@User() user: IJwtSignin) {
        return this.sessionsService.listOfLearnerByConnectedFormateur(user)
    }
    @Put('session/assign')
    @UseGuards(JwtAuthGuardAsFormateur)
    async attributeSessionToUser(@Body() assignFormateurToSessionDto: AssignFormateurToSessionDto) {
        return this.sessionsService.assignFormateurToSession(assignFormateurToSessionDto)
    }
    @Get('list/listebyformateur')
    @UseGuards(JwtAuthGuardAsFormateur)
    async loadMySessionsAsFormateur(@User() user) {
        return this.sessionsService.listAllSessionsByOwnAsFormateur(user)
    }
    @Get('list/listebyformateur/:idinstructor')
    @UseGuards(JwtAuthGuardAsFormateur)
    async loadMySessionsByIdFormateur(@Param("idinstructor", ParseIntPipe) idinstructor: number) {
        return this.sessionsService.listAllSessionsByIdInstructor(idinstructor)
    }
    @Get('list/bygroups/:group')
    @UseGuards(JwtAuthGuardAsStudent)
    async getAllSessionsByGroupe(@User() user, @Param('group') group: 'active' | 'upcoming' | 'completed') {
        return this.sessionsService.listAllSessionByGroupe(user, group);
    }
    @Get('list/bykeyword')
    @UseGuards(JwtAuthGuardAsStudent)
    async getAllSessionsByKeyword(@User() user, @Query('keyword') keyword: string) {
        if (!keyword) return Responder({ status: HttpStatusCode.BadRequest, data: "Le mot de recherche n'est pas envoyé dans la requete !" })
        return this.sessionsService.listAllSessionByKeyword(user, keyword);
    }
    @Post('session/addhomework')
    @UseGuards(JwtAuthGuardAsFormateur)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async addNewHomeWorkSession(@Body() createSessionDto: AddHomeworkSessionDto, @UploadedFile() file: Express.Multer.File) {
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                piece_jointe = link
            }
        }
        return this.sessionsService.createHomework({ ...createSessionDto, piece_jointe })
    }
    @Get('mylist')
    @UseGuards(JwtAuthGuardAsStudent)
    async getAllSessionsByOwner(@User() user: IJwtSignin,) {
        return this.sessionsService.listAllSessionsByOwn(user)
    }
    @Post('session/apply')
    @UseGuards(JwtAuthGuardAsStudent)
    async applyToSession(@User() user: IJwtSignin, @Body() applySessionDto: ApplySessionDto) {
        return this.sessionsService.applyToSession(applySessionDto, user)
    }
    @Get('listprestations')
    @UseGuards(JwtAuthGuardAsFormateur)
    async getListePrestations() {
        return this.sessionsService.getListePrestation()
    }
    @Get('listrelances')
    @UseGuards(JwtAuthGuardAsFormateur)
    async getListeRelances() {
        return this.sessionsService.getListeRealnce()
    }
    @Get('listactions')
    @UseGuards(JwtAuthGuardAsFormateur)
    async getListeActions() {
        return this.sessionsService.getListeActions()
    }
    @Get('rtpcapabilities')
    async getRtpCapabilities() {
        const router = this.mediasoupService.getRouter();
        if (!router) {
            throw new NotFoundException('Router not found');
        }
        const rtpCapabilities = router.rtpCapabilities;
        return rtpCapabilities;
    }
    @Post('sendtransport')
    async createSendTransport(@Body() body: { clientId: string }) {
        const transportOptions = await this.mediasoupService.createSendTransport(body.clientId);
        return { transportOptions };
    }
    @Post('connecttransport')
    async connectTransport(@Body() body: {
        clientId: string;
        dtlsParameters: any;
        transportType: 'send' | 'recv';
    }) {
        const transport = this.mediasoupService.getTransport(body.clientId, body.transportType);
        if (!transport) throw new Error('Transport not found');
        await transport.connect({ dtlsParameters: body.dtlsParameters });
        return { connected: true };
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
    async updateSession(@Body() updateSessionDto: UpdateSessionDto, @Param('idSession', ParseIntPipe) idSession: number, @UploadedFile() file: Express.Multer.File,) {
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                piece_jointe = link
            }
        }
        return this.sessionsService.updateSession({ ...updateSessionDto, piece_jointe }, idSession)
    }
    @Post('session/add')
    @UseGuards(JwtAuthGuardAsFormateur)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async addNewSession(@Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.createSession({ ...createSessionDto })
    }
    @Get(":idsession/:idcours/seances")
    @UseGuards(JwtAuthGuard)
    async getSeancesList(@Param('idsession', ParseIntPipe) idsession: number, @Param('idcours', ParseIntPipe) idcours: number,) {
        return this.sessionsService.listAllSeancesBySession(idsession, idcours)
    }
    @Post('session/addseance')
    @UseGuards(JwtAuthGuardAsFormateur)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async addNewSeanceSession(@Body() createSessionDto: AddSeanceSessionDto, @UploadedFile() file: Express.Multer.File,) {
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                piece_jointe = link
            }
        }
        return this.sessionsService.createSeance({ ...createSessionDto, piece_jointe })
    }
    @Post('session/addhomework')
    @UseGuards(JwtAuthGuardAsFormateur)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async addNewHomeworkSession(@Body() createSessionDto: AddSeanceSessionDto, @UploadedFile() file: Express.Multer.File,) {
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                piece_jointe = link
            }
        }
        return this.sessionsService.createSeance({ ...createSessionDto, piece_jointe })
    }
    @Delete('session/addseance/:idSeance')
    @UseGuards(JwtAuthGuardAsFormateur)
    async deleteSeanceSession(@Param('idSeance', ParseIntPipe) idSeance: number) {
        return this.sessionsService.deleteseance(idSeance)
    }
    @Put('session/addseance/:idSeance')
    @UseGuards(JwtAuthGuardAsFormateur)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async updateSeanceSession(@Body() createSessionDto: any, @UploadedFile() file: Express.Multer.File, @Param('idSeance', ParseIntPipe) idSeance: number) {
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                piece_jointe = link
            }
        }
        return this.sessionsService.updateSeance({ ...createSessionDto, piece_jointe }, idSeance)
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
