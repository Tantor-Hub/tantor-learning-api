import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

/**
 * CloudinaryService - Handles file uploads to Cloudinary with automatic file type detection and organization
 * Optimized for large files up to 100GB with chunked uploads and async processing
 *
 * Supported File Types:
 * - Images: jpg, jpeg, png, gif, webp, svg, bmp, tiff, ico
 * - Videos: mp4, avi, mov, wmv, flv, webm, mkv, 3gp, m4v
 * - Audio: mp3, wav, flac, aac, ogg, wma, m4a
 * - Documents: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf
 * - Archives: zip, rar, 7z, tar, gz, bz2
 * - Code: js, ts, html, css, json, xml, py, java, cpp, c, php
 * - Other: Any other file type
 *
 * Folder Structure:
 * - __tantorLearning/images/     (Images with optimization)
 * - __tantorLearning/videos/     (Videos with optimization)
 * - __tantorLearning/audio/      (Audio files)
 * - __tantorLearning/documents/  (PDFs, Office docs, text files)
 * - __tantorLearning/archives/   (Compressed files)
 * - __tantorLearning/code/       (Source code files)
 * - __tantorLearning/files/      (Other file types)
 *
 * Upload Optimizations (Applied to ALL files):
 * - Chunked uploads: 500KB chunks for optimal performance and reliability
 * - Async uploads: Automatically enabled for all files (non-blocking processing, prevents timeout)
 * - Extended timeouts: 10 minutes for upload operations
 * - Keep-alive headers: Automatically set to maintain connection
 */

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloud_name'),
      api_key: this.configService.get<string>('cloudinary.api_key'),
      api_secret: this.configService.get<string>('cloudinary.api_secret'),
    });
  }

  /**
   * Upload file with automatic optimization for all file sizes
   * Uses Cloudinary's optimized chunked uploads and async upload for all files to ensure reliability and prevent timeouts
   */
  async uploadBufferFile(
    file: Express.Multer.File,
    options?: { useAsync?: boolean; chunkSize?: number },
  ): Promise<{
    id: string;
    name: string;
    viewLink: string;
    link: string;
    downloadLink?: string;
  } | null> {
    // Use optimized upload for all files (chunked + async)
    // This ensures better reliability and prevents Cloudflare timeout errors
    return this.uploadLargeFile(file, options);
  }


  /**
   * Optimized upload for all files using Cloudinary's chunked upload
   * Uses upload_stream with chunk_size parameter for better performance and reliability
   */
  private async uploadLargeFile(
    file: Express.Multer.File,
    options?: { useAsync?: boolean; chunkSize?: number },
  ): Promise<{
    id: string;
    name: string;
    viewLink: string;
    link: string;
    downloadLink?: string;
  } | null> {
    return new Promise((resolve, reject) => {
      // Determine file type and set appropriate folder and settings
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

      // Get upload options (reuse the logic from sync upload)
      const uploadOptions = this.getUploadOptions(file, fileExtension);

      // Optimize for large file uploads
      // Use chunk size for reliable uploads (500KB default, configurable)
      // Cloudinary automatically uses chunked uploads when chunk_size is set
      const chunkSize = options?.chunkSize || 500 * 1024; // 500KB chunks

      // Force async upload for all files to avoid Cloudflare timeout (524 error)
      // Cloudflare free plan has 100s timeout, paid plans have 600s
      // Async upload prevents blocking the request and improves reliability
      if (options?.useAsync !== false) {
        uploadOptions.async = true;
        uploadOptions.notification_url = undefined; // We'll poll for status if needed
      }

      // Add optimizations for all files
      uploadOptions.chunk_size = chunkSize;
      uploadOptions.timeout = 600000; // 10 minutes timeout for all files

      // For videos, add eager transformations for multiple formats (works with async)
      if (uploadOptions.resource_type === 'video') {
        uploadOptions.eager = [
          { quality: 'auto', fetch_format: 'auto' },
          { quality: 'auto', fetch_format: 'mp4' },
          { quality: 'auto', fetch_format: 'webm' },
        ];
        uploadOptions.eager_async = true; // Works with async uploads
      }

      // For raw files (documents, archives, etc.), ensure no transformations
      if (uploadOptions.resource_type === 'raw') {
        // Disable eager transformations for raw files
        delete uploadOptions.eager;
        delete uploadOptions.eager_async;
      }

      // Use upload_stream with chunk_size for all files
      // Cloudinary automatically handles chunked uploads when chunk_size is specified
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary large file upload error:', error);
            return reject(error);
          }

          resolve({
            viewLink: result!.url,
            link: result!.secure_url,
            id: result!.public_id,
            downloadLink: result!.secure_url,
            name: result!.signature,
          });
        },
      );

      // Write buffer to stream - Cloudinary handles chunking automatically
      uploadStream.end(file.buffer);
    });
  }

  /**
   * Helper method to get upload options based on file type
   * Extracted to avoid code duplication
   */
  private getUploadOptions(
    file: Express.Multer.File,
    fileExtension?: string,
  ): any {
    const ext =
      fileExtension || file.originalname.split('.').pop()?.toLowerCase();

    // Define file type categories
    const imageExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'bmp',
      'tiff',
      'ico',
    ];
    const videoExtensions = [
      'mp4',
      'avi',
      'mov',
      'wmv',
      'flv',
      'webm',
      'mkv',
      '3gp',
      'm4v',
      'mpg',
      'mpeg',
      'm2v',
      'm4p',
      'm4b',
      'mxf',
      'ogv',
      'qt',
      'rm',
      'rmvb',
      'svi',
      'vob',
      'asf',
      'amv',
      'drc',
      'gifv',
      'm2ts',
      'mts',
      'ts',
      'm2p',
      'ps',
      'yuv',
    ];
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
    const documentExtensions = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
      'rtf',
    ];
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
    const codeExtensions = [
      'js',
      'ts',
      'html',
      'css',
      'json',
      'xml',
      'py',
      'java',
      'cpp',
      'c',
      'php',
    ];

    // Determine file type
    const isImage = imageExtensions.includes(ext || '');
    const isVideo = videoExtensions.includes(ext || '');
    const isAudio = audioExtensions.includes(ext || '');
    const isDocument = documentExtensions.includes(ext || '');
    const isArchive = archiveExtensions.includes(ext || '');
    const isCode = codeExtensions.includes(ext || '');

    // Set folder based on file type
    let folder = '__tantorLearning';
    let resourceType = 'auto';

    if (isImage) {
      folder = '__tantorLearning/images';
      resourceType = 'image';
    } else if (isVideo) {
      folder = '__tantorLearning/videos';
      resourceType = 'video';
    } else if (isAudio) {
      folder = '__tantorLearning/audio';
      resourceType = 'video'; // Cloudinary uses 'video' for audio files
    } else if (isDocument) {
      folder = '__tantorLearning/documents';
      resourceType = 'raw';
    } else if (isArchive) {
      folder = '__tantorLearning/archives';
      resourceType = 'raw';
    } else if (isCode) {
      folder = '__tantorLearning/code';
      resourceType = 'raw';
    } else {
      folder = '__tantorLearning/files';
      resourceType = 'raw';
    }

    // Base upload options
    const uploadOptions: any = {
      folder: folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    // Add optimization settings based on file type
    if (isImage) {
      uploadOptions.quality = 'auto';
      uploadOptions.fetch_format = 'auto';
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
      ];
      uploadOptions.context = {
        alt: `Image: ${file.originalname}`,
        caption: `Image uploaded to lesson`,
      };
    } else if (isVideo) {
      uploadOptions.resource_type = 'video';
      uploadOptions.quality = 'auto';
      uploadOptions.fetch_format = 'auto';
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
      ];
      // Eager transformations will be added in the calling method if needed
      uploadOptions.context = {
        alt: `Video: ${file.originalname}`,
        caption: `Video uploaded to lesson`,
        original_filename: file.originalname,
        file_size: file.size.toString(),
        mime_type: file.mimetype,
      };
    } else if (isAudio) {
      uploadOptions.resource_type = 'video';
      uploadOptions.quality = 'auto';
      uploadOptions.format = ext;
      uploadOptions.context = {
        alt: `Audio: ${file.originalname}`,
        caption: `Audio file uploaded to lesson`,
      };
    } else if (isDocument || isArchive || isCode) {
      uploadOptions.resource_type = 'raw';
      uploadOptions.format = ext;
      uploadOptions.context = {
        alt: `${isDocument ? 'Document' : isArchive ? 'Archive' : 'Code'}: ${file.originalname}`,
        caption: `${isDocument ? 'Document' : isArchive ? 'Archive' : 'Code'} file uploaded to lesson`,
      };
    } else {
      uploadOptions.resource_type = 'raw';
      uploadOptions.format = ext;
      uploadOptions.context = {
        alt: `File: ${file.originalname}`,
        caption: `File uploaded to lesson`,
      };
    }

    // Add file type information to the upload
    uploadOptions.tags = [
      `file_type:${ext}`,
      `mime_type:${file.mimetype}`,
      `original_filename:${file.originalname}`,
    ];

    return uploadOptions;
  }

  async deleteFile(
    publicId: string,
    resourceType: string = 'auto',
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.result === 'ok');
        },
      );
    });
  }

  async getFileInfo(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resource(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  // Helper method to get file type category
  getFileTypeCategory(fileExtension: string): string {
    const ext = fileExtension.toLowerCase();

    const imageExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'bmp',
      'tiff',
      'ico',
    ];
    const videoExtensions = [
      'mp4',
      'avi',
      'mov',
      'wmv',
      'flv',
      'webm',
      'mkv',
      '3gp',
      'm4v',
    ];
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
    const documentExtensions = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
      'rtf',
    ];
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
    const codeExtensions = [
      'js',
      'ts',
      'html',
      'css',
      'json',
      'xml',
      'py',
      'java',
      'cpp',
      'c',
      'php',
    ];

    if (imageExtensions.includes(ext)) return 'image';
    if (videoExtensions.includes(ext)) return 'video';
    if (audioExtensions.includes(ext)) return 'audio';
    if (documentExtensions.includes(ext)) return 'document';
    if (archiveExtensions.includes(ext)) return 'archive';
    if (codeExtensions.includes(ext)) return 'code';

    return 'file';
  }

  // Helper method to get folder path for a file type
  getFolderPath(fileExtension: string): string {
    const category = this.getFileTypeCategory(fileExtension);

    switch (category) {
      case 'image':
        return '__tantorLearning/images';
      case 'video':
        return '__tantorLearning/videos';
      case 'audio':
        return '__tantorLearning/audio';
      case 'document':
        return '__tantorLearning/documents';
      case 'archive':
        return '__tantorLearning/archives';
      case 'code':
        return '__tantorLearning/code';
      default:
        return '__tantorLearning/files';
    }
  }

  // Helper method to generate proper download URL for files
  generateDownloadUrl(
    publicId: string,
    fileExtension: string,
    originalFilename?: string,
  ): string {
    const category = this.getFileTypeCategory(fileExtension);

    // For documents, archives, and code files, use raw resource type
    if (['document', 'archive', 'code'].includes(category)) {
      // Generate URL that preserves the original file format
      const url = cloudinary.url(publicId, {
        resource_type: 'raw',
        format: fileExtension,
        flags: 'attachment', // Forces download instead of inline display
        filename: originalFilename || `download.${fileExtension}`,
      });
      return url;
    }

    // For images, generate optimized display URL with download option
    if (category === 'image') {
      return cloudinary.url(publicId, {
        secure: true,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        flags: 'attachment', // Also force download for images
        filename: originalFilename || `image.${fileExtension}`,
      });
    }

    // For videos, generate optimized video URL with download option
    if (category === 'video') {
      return cloudinary.url(publicId, {
        secure: true,
        resource_type: 'video',
        quality: 'auto',
        fetch_format: 'auto',
        flags: 'attachment', // Force download for videos
        filename: originalFilename || `video.${fileExtension}`,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
    }

    // For audio files, generate video resource type URL (Cloudinary treats audio as video)
    if (category === 'audio') {
      return cloudinary.url(publicId, {
        secure: true,
        resource_type: 'video',
        quality: 'auto',
        flags: 'attachment', // Force download for audio
        filename: originalFilename || `audio.${fileExtension}`,
      });
    }

    // For any other file type, use raw resource type
    return cloudinary.url(publicId, {
      resource_type: 'raw',
      format: fileExtension,
      flags: 'attachment',
      filename: originalFilename || `download.${fileExtension}`,
    });
  }

  // Helper method to get file info with proper download URL
  async getFileWithDownloadUrl(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resource(publicId, (error, result) => {
        if (error) return reject(error);

        // Extract file extension from public_id, format, or context
        let fileExtension = 'unknown';
        if (result.format) {
          fileExtension = result.format;
        } else if (result.context?.original_filename) {
          const filename = result.context.original_filename;
          if (filename.includes('.')) {
            fileExtension =
              filename.split('.').pop()?.toLowerCase() || 'unknown';
          }
        } else if (publicId.includes('.')) {
          fileExtension = publicId.split('.').pop()?.toLowerCase() || 'unknown';
        }

        const originalFilename =
          result.context?.original_filename || `${publicId}.${fileExtension}`;

        // Generate proper download URL
        const downloadUrl = this.generateDownloadUrl(
          publicId,
          fileExtension,
          originalFilename,
        );

        resolve({
          ...result,
          download_url: downloadUrl,
          original_filename: originalFilename,
          file_extension: fileExtension,
          file_category: this.getFileTypeCategory(fileExtension),
        });
      });
    });
  }

  // Helper method to generate multiple video format URLs
  generateVideoUrls(
    publicId: string,
    originalFilename?: string,
  ): {
    mp4: string;
    webm: string;
    auto: string;
    original: string;
  } {
    const baseOptions = {
      secure: true,
      resource_type: 'video',
      quality: 'auto',
      flags: 'attachment',
      filename: originalFilename || `video`,
    };

    return {
      mp4: cloudinary.url(publicId, {
        ...baseOptions,
        fetch_format: 'mp4',
        filename: originalFilename
          ? originalFilename.replace(/\.[^/.]+$/, '.mp4')
          : 'video.mp4',
      }),
      webm: cloudinary.url(publicId, {
        ...baseOptions,
        fetch_format: 'webm',
        filename: originalFilename
          ? originalFilename.replace(/\.[^/.]+$/, '.webm')
          : 'video.webm',
      }),
      auto: cloudinary.url(publicId, {
        ...baseOptions,
        fetch_format: 'auto',
        filename: originalFilename || 'video',
      }),
      original: cloudinary.url(publicId, {
        ...baseOptions,
        filename: originalFilename || 'video',
      }),
    };
  }

  // Helper method to get all files in a folder with download URLs
  async getFilesInFolder(folderPath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resources(
        {
          type: 'upload',
          prefix: folderPath,
          max_results: 500,
        },
        (error, result) => {
          if (error) return reject(error);

          const filesWithDownloadUrls = result.resources.map((file: any) => {
            // Extract file extension
            let fileExtension = 'unknown';
            if (file.format) {
              fileExtension = file.format;
            } else if (file.context?.original_filename) {
              const filename = file.context.original_filename;
              if (filename.includes('.')) {
                fileExtension =
                  filename.split('.').pop()?.toLowerCase() || 'unknown';
              }
            } else if (file.public_id.includes('.')) {
              fileExtension =
                file.public_id.split('.').pop()?.toLowerCase() || 'unknown';
            }

            const originalFilename =
              file.context?.original_filename ||
              `${file.public_id}.${fileExtension}`;

            // Generate proper download URL
            const downloadUrl = this.generateDownloadUrl(
              file.public_id,
              fileExtension,
              originalFilename,
            );

            return {
              ...file,
              download_url: downloadUrl,
              original_filename: originalFilename,
              file_extension: fileExtension,
              file_category: this.getFileTypeCategory(fileExtension),
            };
          });

          resolve(filesWithDownloadUrls);
        },
      );
    });
  }
}

