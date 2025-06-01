import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { UsersService } from 'src/users/users.service';
import { CoursService } from './cours.service';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { CreateCoursDto } from './dto/create-cours.dto';
import { CreatePresetCoursDto } from './dto/create-preset-cours.dto';

@Controller('cours')
export class CoursController {

    constructor(
        private readonly usersService: UsersService,
        private readonly googleDriveService: GoogleDriveService,
        private readonly coursService: CoursService,
    ) { }

    @Get("presets/list")
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async listDeTousLesCours() {
        return this.coursService.getListCours()
    }
    @Get("presets/add")
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async addPresetCours(@User() user: IJwtSignin, @Body() createCoursDto: CreatePresetCoursDto) {
        return this.coursService.addPresetCours(user, createCoursDto)
    }
    
}
