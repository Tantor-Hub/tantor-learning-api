import { Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors, UseGuards, Delete } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';

@Controller('formations')
export class FormationsController {

    constructor(
        private readonly formationsService: FormationsService,
        private readonly googleDriveService: GoogleDriveService
    ) { }
    
    @Delete('formation/:idFormation')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async deleteSession(@Param('idFormation', ParseIntPipe) idFormation: number,) {
        return this.formationsService.delete(idFormation)
    }

    @Post('formation/add')
    @UseGuards(JwtAuthGuardAsFormateur)
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
    @UseGuards(JwtAuthGuardAsFormateur)
    async getTypesFormations() {
        return this.formationsService.getTypesFormations()
    }

    @Get('list')
    @UseGuards(JwtAuthGuardAsFormateur)
    async getAllFormations() {
        return this.formationsService.gatAllFormations()
    }

    @Get('list/bythematic/:idThematic')
    @UseGuards(JwtAuthGuardAsFormateur)
    async getAllFormationsByThematic(@Param('idThematic', ParseIntPipe) idThematic: number) {
        return this.formationsService.gatAllFormationsByThematic(idThematic)
    }

    @Get('list/bycategory/:idCategory')
    @UseGuards(JwtAuthGuardAsFormateur)
    async getAllFormationsByCategory(@Param('idCategory', ParseIntPipe) idCategory: number) {
        return this.formationsService.gatAllFormationsByCategory(idCategory)
    }

    @Get('list/by/:idThematic/:idCategory')
    @UseGuards(JwtAuthGuardAsFormateur)
    async getAllFormationsByThematicAndCategory(@Param('idCategory', ParseIntPipe) idCategory: number, @Param('idThematic', ParseIntPipe) idThematic: number) {
        return this.formationsService.gatAllFormationsByThematicAndCategory(idThematic, idCategory)
    }
}
