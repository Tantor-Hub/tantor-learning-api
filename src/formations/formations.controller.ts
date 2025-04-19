import { Body, Controller, Get, Post } from '@nestjs/common';
import { FormationsService } from './formations.service';

@Controller('formations')
export class FormationsController {

    constructor(private readonly formationsService: FormationsService) { }

    @Get('types')
    async getTypesFormations() {
        return this.formationsService.getTypesFormations()
    }

    @Get('list')
    async getAllFormations(){
        return this.formationsService.gatAllFormations()
    }
}
