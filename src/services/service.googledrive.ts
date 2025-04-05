import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'stream';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class GoogleDriveService {
  private drive: any;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../../config/google-service-account.json'), // Ton fichier JSON de clé privée
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async uploadFile(file: Express.Multer.File): Promise<any> {
    const { originalname, buffer, mimetype } = file;

    const fileMetadata = {
      name: originalname,
      parents: ['TA_FOLDER_ID_ICI'], // Optionnel: ID du dossier Drive où tu veux stocker
    };

    const media = {
      mimeType: mimetype,
      body: Readable.from(buffer),
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    return response.data; // Contient les liens vers ton fichier
  }
}
