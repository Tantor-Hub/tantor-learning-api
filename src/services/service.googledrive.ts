import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleDriveService {
  private drive: any;
  private owner: string;

  constructor(private readonly configService: ConfigService) {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../../src/utils/utiles.googleservices.json'),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.owner = this.configService.get<string>('APPSMTPUSER') || "tantorelearning@gmail.com";
    this.drive = google.drive({ version: 'v3', auth });
  }

  async uploadBufferFile(file: Express.Multer.File, folderId?: string) {
    const fileMetadata: any = {
      name: file.originalname,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      fields: 'id, name, webViewLink',
    });

    const fileId = response.data.id;

    await this.drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    await this.drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'user',
        emailAddress: this.owner,
      },
    });

    return {
      id: fileId,
      name: response.data.name,
      link: response.data.webViewLink,
    };
  }
}
