import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { UploadSwagger } from '../swagger/swagger.uploads';

@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuardAsSecretary)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation(UploadSwagger.uploadImage)
  @ApiConsumes(UploadSwagger.uploadImageConsumes)
  @ApiBody(UploadSwagger.uploadImageBody)
  @ApiResponse(UploadSwagger.uploadImageSuccess)
  @ApiResponse(UploadSwagger.uploadImageBadRequest)
  @ApiResponse(UploadSwagger.uploadImageUnauthorized)
  @ApiResponse(UploadSwagger.uploadImageForbidden)
  @ApiResponse(UploadSwagger.uploadImageServerError)
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return await this.uploadsService.uploadImage(file, req.user.id_user);
  }

  @Get('my-uploads')
  @ApiOperation(UploadSwagger.getUserUploads)
  @ApiResponse(UploadSwagger.getUserUploadsSuccess)
  @ApiResponse(UploadSwagger.uploadImageUnauthorized)
  @ApiResponse(UploadSwagger.uploadImageForbidden)
  async getUserUploads(@Req() req) {
    return await this.uploadsService.getUserUploads(req.user.id_user);
  }

  @Delete(':id')
  @ApiOperation(UploadSwagger.deleteUpload)
  @ApiResponse(UploadSwagger.deleteUploadSuccess)
  @ApiResponse(UploadSwagger.deleteUploadBadRequest)
  @ApiResponse(UploadSwagger.uploadImageUnauthorized)
  @ApiResponse(UploadSwagger.uploadImageForbidden)
  async deleteUpload(@Param('id') id: string, @Req() req) {
    return await this.uploadsService.deleteUpload(id, req.user.id_user);
  }
}
