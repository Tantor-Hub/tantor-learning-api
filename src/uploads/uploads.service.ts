import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UploadedFile } from '../models/model.uploadedfile';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadsService {
  constructor(
    @InjectModel(UploadedFile)
    private uploadedFileModel: typeof UploadedFile,
  ) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{
    status: number;
    message: string;
    data: {
      url: string;
      publicId: string;
      id: string;
      originalName: string;
      size: number;
      mimeType: string;
    };
  }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 10MB.',
      );
    }

    try {
      // Create a readable stream from the buffer
      const stream = Readable.from(file.buffer);

      // Upload to Cloudinary using stream
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'documents',
            resource_type: 'image',
            transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        stream.pipe(uploadStream);
      });

      const uploadResult = result as any;

      // Save upload record to database
      const uploadedFile = await this.uploadedFileModel.create({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadedBy: userId,
      });

      return {
        status: 201,
        message: 'Image uploaded successfully',
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          id: uploadedFile.id,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
        },
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new InternalServerErrorException(
        'Failed to upload image to Cloudinary',
      );
    }
  }

  async getUserUploads(userId: string): Promise<UploadedFile[]> {
    return await this.uploadedFileModel.findAll({
      where: { uploadedBy: userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async deleteUpload(
    uploadId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const uploadedFile = await this.uploadedFileModel.findOne({
      where: { id: uploadId, uploadedBy: userId },
    });

    if (!uploadedFile) {
      throw new BadRequestException(
        'Upload not found or you do not have permission to delete it',
      );
    }

    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(uploadedFile.publicId);

      // Delete from database
      await uploadedFile.destroy();

      return { message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
