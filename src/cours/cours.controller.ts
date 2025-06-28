import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { UsersService } from 'src/users/users.service';
import { CoursService } from './cours.service';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { CreateCoursDto } from './dto/create-cours.dto';
import { CreatePresetCoursDto } from './dto/create-preset-cours.dto';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { AssignFormateurToSessionDto } from 'src/sessions/dto/attribute-session.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDocumentDto } from './dto/create-documents.dto';
import * as path from 'path';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { CreateCoursContentDto } from './dto/create-cours-content.dto';
import { CreateEvaluationFullDto } from './dto/create-evaluation.dto';

@Controller('courses')
export class CoursController {

    constructor(
        private readonly usersService: UsersService,
        private readonly googleDriveService: GoogleDriveService,
        private readonly coursService: CoursService,
    ) { }
    @Get("course/course/evaluations/conditions")
    @UseGuards(JwtAuthGuardAsFormateur)
    async getConditionEvaluation(@User() user: IJwtSignin) {
        return this.coursService.getconditionsevaluation(user);
    }
    @Get("course/course/evaluations/tools")
    @UseGuards(JwtAuthGuardAsFormateur)
    async getMaterialsEvaluation(@User() user: IJwtSignin) {
        return this.coursService.getallowedmatosevaluation(user);
    }
    @Get("course/course/evaluations/types")
    @UseGuards(JwtAuthGuardAsFormateur)
    async getTypesEvaluation(@User() user: IJwtSignin) {
        return this.coursService.gettypesevaluation(user);
    }
    @Delete("course/evaluations/evaluation/:idevaluation")
    @UseGuards(JwtAuthGuardAsFormateur)
    async deleteEvaluation(@User() user: IJwtSignin, @Param('idevaluation', ParseIntPipe) idevaluation: number,) {
        return this.coursService.deleteEvaluation(user, idevaluation)
    }
    @Get("course/evaluations/evaluation/:idevaluation")
    @UseGuards(JwtAuthGuard)
    async getEvaluationById(@Param('idevaluation', ParseIntPipe) idevaluation: number,) {
        return this.coursService.getEvaluationById(idevaluation)
    }
    @Get("course/evaluations/:idsession/:idcours")
    @UseGuards(JwtAuthGuard)
    async getEvaluationsByCours(@Param('idcours', ParseIntPipe) idcours: number, @Param('idsession', ParseIntPipe) idsession: number,) {
        return this.coursService.getEvaluationsByCours(idcours, idsession)
    }
    @Post("course/addevaluation")
    @UseGuards(JwtAuthGuardAsFormateur)
    async addEvaluationToCours(@User() user: IJwtSignin, @Body() createEvaluationDto: CreateEvaluationFullDto) {
        return this.coursService.addEvaluationToCours(user, createEvaluationDto)
    }
    @Get("course/:idcours")
    @UseGuards(JwtAuthGuard)
    async getCoursById(@User() user: IJwtSignin, @Param('idcours', ParseIntPipe) idcours: number,) {
        return this.coursService.getCoursById(idcours)
    }
    @Get("course/getdocuments/:idcours")
    // @UseGuards(JwtAuthGuard)
    async getDocumentsByCours(@Param('idcours', ParseIntPipe) idcours: number) {
        return this.coursService.getDocumentsByCours(idcours)
    }
    @Post("course/addcontent")
    @UseGuards(JwtAuthGuardAsFormateur)
    async addContentToCourse(@User() user: IJwtSignin, @Body() content: CreateCoursContentDto) {
        return this.coursService.addCoursContent(user, content)
    }
    @Get("listall/:idSession")
    @UseGuards(JwtAuthGuard)
    async listDeTousLesCoursParSesson(@Param('idSession', ParseIntPipe) idSession: number,) {
        return this.coursService.getListCoursAllBySesson(idSession)
    }
    @Get("presets/list")
    @UseGuards(JwtAuthGuard)
    async listDeTousPresetsLesCours() {
        return this.coursService.getListCours()
    }
    @Get("listall")
    @UseGuards(JwtAuthGuard)
    async listDeTousLesCours() {
        return this.coursService.getListCoursAll()
    }
    @Post("presets/add")
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async addPresetCours(@User() user: IJwtSignin, @Body() createCoursDto: CreatePresetCoursDto) {
        return this.coursService.addPresetCours(user, createCoursDto)
    }
    @Put("course/:idcours")
    @UseGuards(JwtAuthGuardAsFormateur)
    async addCoursAsFreeToLibrairies(@User() user: IJwtSignin, @Param('idcours', ParseIntPipe) idcours: number,) {
        return this.coursService.addCoursToLibrairie(idcours, user)
    }
    @Post("course/add")
    @UseGuards(JwtAuthGuardAsFormateur)
    async addCours(@User() user: IJwtSignin, @Body() createCoursDto: CreateCoursDto) {
        return this.coursService.addCoursToSession(user, createCoursDto)
    }
    @Put("course/assign")
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async assignCours(@User() user: IJwtSignin, @Body() createCoursDto: AssignFormateurToSessionDto) {
        return this.coursService.assignFormateurToSession(user, createCoursDto)
    }
    @Post("course/adddocuments")
    @UseGuards(JwtAuthGuardAsFormateur)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async addNewSeanceSession(@User() user: IJwtSignin, @Body() doc: CreateDocumentDto, @UploadedFile() file: Express.Multer.File,) {
        let piece_jointe: any = null;
        let type: string = "";
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            if (result) {
                const { id, name, link, } = result
                const extension = path.extname(file.originalname);
                type = extension.replace('.', '').toLowerCase();
                piece_jointe = link
            }
        }
        return this.coursService.addDocumentsToCours(user, { ...doc, piece_jointe, type })
    }
}
