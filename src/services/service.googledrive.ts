import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleDriveService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: 'dfjs9os9x', //this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: '132649767558245', //this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: 'N5tiVqxnZqZTjW7Kd9kjk0VGAh8', //this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadBufferFile(file: Express.Multer.File): Promise<{
    id: string;
    name: string;
    viewLink: string;
    link: string;
    downloadLink?: string;
  } | null> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: '__tantorLearning' }, (error, result) => {
          if (error) return reject(error);
          resolve({
            viewLink: result!.url,
            link: result!.secure_url,
            id: result!.public_id,
            downloadLink: result!.secure_url,
            name: result!.signature,
          });
        })
        .end(file.buffer);
    });
  }
}
