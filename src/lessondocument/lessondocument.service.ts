import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lessondocument } from 'src/models/model.lessondocument';
import { Users } from 'src/models/model.users';
import { Lesson } from 'src/models/model.lesson';
import { CreateLessondocumentDto } from './dto/create-lessondocument.dto';
import { UpdateLessondocumentDto } from './dto/update-lessondocument.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { GoogleDriveService } from 'src/services/service.googledrive';

@Injectable()
export class LessondocumentService {
  constructor(
    @InjectModel(Lessondocument)
    public lessondocumentModel: typeof Lessondocument,
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  // Helper method to generate download URL for a document
  private generateDocumentDownloadUrl(doc: any): string | any {
    // If piece_jointe is already a valid Cloudinary URL, return it as is
    if (doc.piece_jointe && typeof doc.piece_jointe === 'string') {
      // Check if it's already a valid Cloudinary URL
      if (doc.piece_jointe.includes('res.cloudinary.com')) {
        return doc.piece_jointe;
      }
    }

    let downloadUrl = doc.piece_jointe;
    try {
      // Only try to generate a new URL if piece_jointe is not a valid Cloudinary URL
      if (
        !doc.piece_jointe ||
        !doc.piece_jointe.includes('res.cloudinary.com')
      ) {
        console.warn(
          `Invalid or missing piece_jointe URL for document ${doc.id}:`,
          doc.piece_jointe,
        );
        return doc.piece_jointe || null;
      }

      // Extract public ID from Cloudinary URL
      const urlParts = doc.piece_jointe.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExtension.split('.')[0];

      // Get file extension from filename, document type, or URL
      let fileExtension = 'pdf'; // default
      if (doc.file_name && doc.file_name.includes('.')) {
        fileExtension = doc.file_name.split('.').pop()?.toLowerCase() || 'pdf';
      } else if (doc.type) {
        fileExtension = doc.type.toLowerCase();
      } else if (publicIdWithExtension.includes('.')) {
        fileExtension =
          publicIdWithExtension.split('.').pop()?.toLowerCase() || 'pdf';
      }

      // Check if it's a video file
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

      if (videoExtensions.includes(fileExtension)) {
        // For videos, return multiple format URLs
        const videoUrls = this.googleDriveService.generateVideoUrls(
          publicId,
          doc.file_name,
        );
        return {
          download_url: videoUrls.auto, // Default download URL
          video_urls: videoUrls, // All format options
          primary_format: 'auto',
        };
      } else {
        // For other files, generate standard download URL
        downloadUrl = this.googleDriveService.generateDownloadUrl(
          publicId,
          fileExtension,
          doc.file_name,
        );
      }
    } catch (error) {
      console.warn(
        `Could not generate download URL for document ${doc.id}:`,
        error.message,
      );
      // Return the original piece_jointe if generation fails
      return doc.piece_jointe;
    }
    return downloadUrl;
  }

  async findAll(): Promise<ResponseServer> {
    try {
      console.log('Fetching all lesson documents');
      const lessondocuments = await this.lessondocumentModel.findAll({
        attributes: [
          'id',
          'file_name',
          'piece_jointe',
          'type',
          'title',
          'description',
          'id_lesson',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Lesson,
            required: false,
            as: 'lesson',
            attributes: ['id', 'title', 'description'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Generate download URLs for all documents
      const documentsWithDownloadUrls = lessondocuments.map((doc) => {
        const downloadUrl = this.generateDocumentDownloadUrl(doc);
        return {
          ...doc.toJSON(),
          download_url: downloadUrl,
        };
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          lessondocuments: documentsWithDownloadUrls,
          total: documentsWithDownloadUrls.length,
        },
        customMessage: 'Lesson documents retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching lesson documents:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while fetching lesson documents',
          error: error.message,
        },
      });
    }
  }

  async findByLessonId(lessonId: string): Promise<ResponseServer> {
    try {
      // First verify that the lesson exists
      const lesson = await this.lessonModel.findByPk(lessonId);
      if (!lesson) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Lesson not found',
        });
      }

      const lessondocuments = await this.lessondocumentModel.findAll({
        where: { id_lesson: lessonId },
        attributes: [
          'id',
          'file_name',
          'piece_jointe',
          'type',
          'title',
          'description',
          'id_lesson',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Lesson,
            required: false,
            as: 'lesson',
            attributes: ['id', 'title', 'description'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Generate download URLs for all documents
      const documentsWithDownloadUrls = lessondocuments.map((doc) => {
        const downloadUrl = this.generateDocumentDownloadUrl(doc);
        return {
          ...doc.toJSON(),
          download_url: downloadUrl,
        };
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          lessondocuments: documentsWithDownloadUrls,
          total: documentsWithDownloadUrls.length,
        },
        customMessage: 'Lesson documents retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching lesson documents by lesson ID:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while fetching lesson documents',
          error: error.message,
        },
      });
    }
  }

  async findByCreator(creatorId: string): Promise<ResponseServer> {
    try {
      // First verify that the creator exists
      const creator = await this.userModel.findByPk(creatorId);
      if (!creator) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Creator not found',
        });
      }

      const lessondocuments = await this.lessondocumentModel.findAll({
        where: { createdBy: creatorId },
        attributes: [
          'id',
          'file_name',
          'piece_jointe',
          'type',
          'title',
          'description',
          'id_lesson',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Lesson,
            required: false,
            as: 'lesson',
            attributes: ['id', 'title', 'description'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Generate download URLs for all documents
      const documentsWithDownloadUrls = lessondocuments.map((doc) => {
        const downloadUrl = this.generateDocumentDownloadUrl(doc);
        return {
          ...doc.toJSON(),
          download_url: downloadUrl,
        };
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          lessondocuments: documentsWithDownloadUrls,
          total: documentsWithDownloadUrls.length,
          creator: {
            id: creator.id,
            firstName: creator.firstName,
            lastName: creator.lastName,
            email: creator.email,
          },
        },
        customMessage:
          'Lesson documents created by instructor retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching lesson documents by creator:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message:
            'Internal server error while fetching lesson documents by creator',
          error: error.message,
        },
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const lessondocument = await this.lessondocumentModel.findByPk(id, {
        attributes: [
          'id',
          'file_name',
          'piece_jointe',
          'type',
          'title',
          'description',
          'id_lesson',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Lesson,
            required: false,
            as: 'lesson',
            attributes: ['id', 'title', 'description'],
          },
        ],
      });

      if (!lessondocument) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Lesson document not found',
        });
      }

      // Generate proper download URL for the document
      const downloadUrl = this.generateDocumentDownloadUrl(lessondocument);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          ...lessondocument.toJSON(),
          download_url: downloadUrl,
        },
        customMessage: 'Lesson document retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching lesson document:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while fetching lesson document',
          error: error.message,
        },
      });
    }
  }

  async create(
    user: IJwtSignin,
    documentData: {
      file_name: string;
      piece_jointe: string;
      type: string;
      id_lesson: string;
      title?: string;
      description?: string;
    },
  ): Promise<ResponseServer> {
    try {
      // Validate input parameters
      if (!documentData.file_name || !documentData.piece_jointe) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: 'File name and piece_jointe are required',
        });
      }

      // Verify that the lesson exists
      const lesson = await this.lessonModel.findByPk(documentData.id_lesson);
      if (!lesson) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Lesson not found',
        });
      }

      // Create the lesson document
      const lessondocument = await this.lessondocumentModel.create({
        file_name: documentData.file_name,
        piece_jointe: documentData.piece_jointe,
        type: documentData.type,
        title: documentData.title,
        description: documentData.description,
        id_lesson: documentData.id_lesson,
        createdBy: user.id_user,
      });

      // Fetch the created lesson document with its relationships
      const createdLessondocument = await this.lessondocumentModel.findByPk(
        lessondocument.id,
        {
          include: [
            {
              model: Users,
              required: false,
              as: 'creator',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: Lesson,
              required: false,
              as: 'lesson',
              attributes: ['id', 'title', 'description'],
            },
          ],
        },
      );

      // Log the newly created lesson document
      if (createdLessondocument) {
        console.log('New lesson document created:', {
          id: createdLessondocument.id,
          file_name: createdLessondocument.file_name,
          piece_jointe: createdLessondocument.piece_jointe,
          type: createdLessondocument.type,
          title: createdLessondocument.title,
          description: createdLessondocument.description,
          id_lesson: createdLessondocument.id_lesson,
          createdBy: createdLessondocument.createdBy,
          createdAt: createdLessondocument.createdAt,
          lesson_title: createdLessondocument.lesson?.title,
          creator_name:
            `${createdLessondocument.creator?.firstName || ''} ${createdLessondocument.creator?.lastName || ''}`.trim(),
        });
      }

      return Responder({
        status: HttpStatusCode.Created,
        data: createdLessondocument,
        customMessage: 'Lesson document created successfully',
      });
    } catch (error) {
      console.error('Error creating lesson document:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while creating lesson document',
          error: error.message,
        },
      });
    }
  }

  async update(
    user: IJwtSignin,
    id: string,
    updateLessondocumentDto: UpdateLessondocumentDto,
  ): Promise<ResponseServer> {
    try {
      const lessondocument = await this.lessondocumentModel.findByPk(id);
      if (!lessondocument) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Lesson document not found',
        });
      }

      // Check ownership - only the creator can update the document
      if (lessondocument.createdBy !== user.id_user) {
        console.log(
          `Access denied: User ${user.id_user} attempted to update lesson document ${id} created by ${lessondocument.createdBy}`,
        );
        return Responder({
          status: HttpStatusCode.Forbidden,
          data: 'You can only modify lesson documents that you created',
        });
      }

      // If updating lesson reference, verify it exists
      if (updateLessondocumentDto.id_lesson) {
        const lesson = await this.lessonModel.findByPk(
          updateLessondocumentDto.id_lesson,
        );
        if (!lesson) {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: 'Lesson not found',
          });
        }
      }

      await lessondocument.update(updateLessondocumentDto);

      // Fetch the updated lesson document with its relationships
      const updatedLessondocument = await this.lessondocumentModel.findByPk(
        id,
        {
          include: [
            {
              model: Users,
              required: false,
              as: 'creator',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: Lesson,
              required: false,
              as: 'lesson',
              attributes: ['id', 'title', 'description'],
            },
          ],
        },
      );

      console.log(
        `Lesson document ${id} updated successfully by user ${user.id_user}`,
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: updatedLessondocument,
        customMessage: 'Lesson document updated successfully',
      });
    } catch (error) {
      console.error('Error updating lesson document:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while updating lesson document',
          error: error.message,
        },
      });
    }
  }

  async remove(user: IJwtSignin, id: string): Promise<ResponseServer> {
    try {
      const lessondocument = await this.lessondocumentModel.findByPk(id);
      if (!lessondocument) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Lesson document not found',
        });
      }

      // Check ownership - only the creator can delete the document
      if (lessondocument.createdBy !== user.id_user) {
        console.log(
          `Access denied: User ${user.id_user} attempted to delete lesson document ${id} created by ${lessondocument.createdBy}`,
        );
        return Responder({
          status: HttpStatusCode.Forbidden,
          data: 'You can only delete lesson documents that you created',
        });
      }

      await lessondocument.destroy();

      console.log(
        `Lesson document ${id} deleted successfully by user ${user.id_user}`,
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id },
        customMessage: 'Lesson document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting lesson document:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while deleting lesson document',
          error: error.message,
        },
      });
    }
  }

  async debugUrls(): Promise<ResponseServer> {
    try {
      const lessondocuments = await this.lessondocumentModel.findAll({
        attributes: [
          'id',
          'file_name',
          'piece_jointe',
          'type',
          'title',
          'description',
        ],
        limit: 5, // Only get first 5 for debugging
      });

      const debugData = lessondocuments.map((doc) => {
        const downloadUrl = this.generateDocumentDownloadUrl(doc);
        return {
          id: doc.id,
          file_name: doc.file_name,
          piece_jointe: doc.piece_jointe,
          type: doc.type,
          title: doc.title,
          generated_download_url: downloadUrl,
          url_analysis: {
            is_cloudinary_url:
              doc.piece_jointe?.includes('res.cloudinary.com') || false,
            url_parts: doc.piece_jointe?.split('/') || [],
            last_part: doc.piece_jointe?.split('/').pop() || null,
          },
        };
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          debug_info: debugData,
          total_documents: debugData.length,
        },
        customMessage: 'Debug information retrieved successfully',
      });
    } catch (error) {
      console.error('Error in debugUrls:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while debugging URLs',
          error: error.message,
        },
      });
    }
  }
}
