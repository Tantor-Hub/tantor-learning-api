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
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { ModuleDeFormation } from 'src/models/model.moduledeformation';
import { ModuleDeFormationService } from './moduledeformation.service';
import { CreateModuleDeFormationDto } from './dto/create-moduledeformation.dto';
import { UpdateModuleDeFormationDto } from './dto/update-moduledeformation.dto';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from 'src/services/service.googledrive';
import {
  ModuleDeFormationCreateApiResponse,
  ModuleDeFormationGetAllApiResponse,
  ModuleDeFormationUpdateApiResponse,
} from './swagger/swagger.moduledeformation';

@ApiTags('Module De Formation')
@ApiBearerAuth()
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
  @ModuleDeFormationCreateApiResponse()
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
  @ModuleDeFormationGetAllApiResponse()
  async findAll(): Promise<any> {
    return this.moduleDeFormationService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @UseInterceptors(
    FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }),
  )
  @ModuleDeFormationUpdateApiResponse()
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateModuleDeFormationDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    let piece_jointe: string | undefined;
    if (file) {
      const result = await this.googleDriveService.uploadBufferFile(file);
      if (result) {
        const { link } = result;
        piece_jointe = link;
      }
    }
    return this.moduleDeFormationService.update(id, updateDto, piece_jointe);
  }
}
