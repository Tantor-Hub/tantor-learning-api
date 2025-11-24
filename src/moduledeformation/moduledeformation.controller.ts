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
import { CloudinaryService } from 'src/services/service.cloudinary';
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
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @UseInterceptors(
    FileInterceptor('piece_jointe', { limits: { fileSize: 107_374_182_400 } }), // 100GB limit
  )
  @ModuleDeFormationCreateApiResponse()
  async create(
    @Body() createDto: CreateModuleDeFormationDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    let piece_jointe: string = '';
    if (file) {
      console.log(`Uploading file: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB), using optimized chunked async upload`);
      
      // Validate file size (100GB limit)
      const maxSize = 100 * 1024 * 1024 * 1024; // 100GB
      if (file.size > maxSize) {
        return {
          status: 400,
          data: 'File size exceeds 100GB limit',
        };
      }

      const result = await this.cloudinaryService.uploadBufferFile(file, {
        useAsync: false,
      });
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
    FileInterceptor('piece_jointe', { limits: { fileSize: 107_374_182_400 } }), // 100GB limit
  )
  @ModuleDeFormationUpdateApiResponse()
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateModuleDeFormationDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    let piece_jointe: string | undefined;
    if (file) {
      const result = await this.cloudinaryService.uploadBufferFile(file, {
        useAsync: false,
      });
      if (result) {
        const { link } = result;
        piece_jointe = link;
      }
    }
    return this.moduleDeFormationService.update(id, updateDto, piece_jointe);
  }
}
