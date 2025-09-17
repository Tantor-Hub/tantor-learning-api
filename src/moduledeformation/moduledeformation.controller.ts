import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ModuleDeFormation } from 'src/models/model.moduledeformation';
import { ModuleDeFormationService } from './moduledeformation.service';
import { CreateModuleDeFormationDto } from './dto/create-moduledeformation.dto';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from 'src/services/service.googledrive';

@Controller('moduledeformation')
export class ModuleDeFormationController {
  constructor(
    private readonly moduleDeFormationService: ModuleDeFormationService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @UseInterceptors(
    FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }),
  )
  async create(
    @Body() createDto: CreateModuleDeFormationDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    let piece_jointe: string = '';
    if (file) {
      const result = await this.googleDriveService.uploadBufferFile(file);
      if (result) {
        const { link } = result;
        piece_jointe = link;
      }
    }
    return this.moduleDeFormationService.create(createDto, piece_jointe);
  }

  @Get()
  async findAll(): Promise<any> {
    return this.moduleDeFormationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.moduleDeFormationService.findOne(id);
  }
}
