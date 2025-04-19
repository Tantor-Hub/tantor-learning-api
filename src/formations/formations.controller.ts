import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { FormationsService } from './formations.service';
import { log } from 'console';

@Controller('formations')
export class FormationsController {

    constructor(private readonly formationsService: FormationsService) { }

    @Get('types')
    async getTypesFormations() {
        return this.formationsService.getTypesFormations()
    }

    @Get('list')
    async getAllFormations() {
        return this.formationsService.gatAllFormations()
    }

    @Get('list/bythematic/:idThematic')
    async getAllFormationsByThematic(@Param('idThematic', ParseIntPipe) idThematic: number) {
        return this.formationsService.gatAllFormationsByThematic(idThematic)
    }

    @Get('list/bycategory/:idCategory')
    async getAllFormationsByCategory(@Param() idCategory: number) {
        return this.formationsService.gatAllFormationsByCategory(idCategory)
    }

    @Get('list/by/:idThematic/:idCategory')
    async getAllFormationsByThematicAndCategory(@Param('idCategory', ParseIntPipe) idCategory: number, @Param('idThematic', ParseIntPipe) idThematic: number) {
        return this.formationsService.gatAllFormationsByThematicAndCategory(idThematic, idCategory)
    }
}
