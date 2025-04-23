import { Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';

@Controller('formations')
export class FormationsController {

    constructor(
        private readonly formationsService: FormationsService,
        private readonly googleDriveService: GoogleDriveService
    ) { }
    
    @Post('formation/add')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    @UseInterceptors(FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }))
    async addNewFormation(@Body() createFormationDto: CreateFormationDto, @UploadedFile() file: Express.Multer.File,) {
        let piece_jointe: any = null;
        if (file) {
            const result = await this.googleDriveService.uploadBufferFile(file);
            const { id, name, link, } = result
            piece_jointe = link
        }
        return this.formationsService.createNewFormation({ ...createFormationDto, lien_contenu: piece_jointe })
    }

    @Get('types')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async getTypesFormations() {
        return this.formationsService.getTypesFormations()
    }

    @Get('list')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async getAllFormations() {
        return this.formationsService.gatAllFormations()
    }

    @Get('list/bythematic/:idThematic')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async getAllFormationsByThematic(@Param('idThematic', ParseIntPipe) idThematic: number) {
        return this.formationsService.gatAllFormationsByThematic(idThematic)
    }

    @Get('list/bycategory/:idCategory')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async getAllFormationsByCategory(@Param('idCategory', ParseIntPipe) idCategory: number) {
        return this.formationsService.gatAllFormationsByCategory(idCategory)
    }

    @Get('list/by/:idThematic/:idCategory')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async getAllFormationsByThematicAndCategory(@Param('idCategory', ParseIntPipe) idCategory: number, @Param('idThematic', ParseIntPipe) idThematic: number) {
        return this.formationsService.gatAllFormationsByThematicAndCategory(idThematic, idCategory)
    }
}
