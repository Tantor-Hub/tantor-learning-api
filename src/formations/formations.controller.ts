import { Controller, Get } from '@nestjs/common';
import { FormationsService } from './formations.service';

@Controller('formations')
export class FormationsController {

    constructor(private readonly formationsService: FormationsService){}

    @Get('/formations/types')
    async getTypesFormations() {
        return this.formationsService.getTypesFormations()
    }
}
