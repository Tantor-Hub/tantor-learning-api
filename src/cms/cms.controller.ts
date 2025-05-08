import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateAppInfosDto } from './dto/create-infos.dto';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';

@Controller('cms')
export class CmsController {
    constructor(private readonly cmsService: CmsService) { }

    @Get('infos')
    async onGetAppInfos() {
        return this.cmsService.onGetAppInfos()
    }

    @Post('infos/add')
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async onAddInfosData(@Body() createAppInfosDto: CreateAppInfosDto) {
        return this.cmsService.onAddAppInfos(createAppInfosDto)
    }
}
