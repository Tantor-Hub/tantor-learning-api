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

@Injectable()
export class LessondocumentService {
  constructor(
    @InjectModel(Lessondocument)
    private lessondocumentModel: typeof Lessondocument,
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
  ) {}

  async findAll(): Promise<ResponseServer> {
    try {
      const lessondocuments = await this.lessondocumentModel.findAll({
        attributes: [
          'id',
          'file_name',
          'url',
          'type',
          'id_lesson',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'CreatedBy',
            attributes: ['id', 'fs_name', 'ls_name', 'email'],
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

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          lessondocuments: lessondocuments,
          total: lessondocuments.length,
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

  async findOne(id: number): Promise<ResponseServer> {
    try {
      const lessondocument = await this.lessondocumentModel.findByPk(id, {
        attributes: [
          'id',
          'file_name',
          'url',
          'type',
          'id_lesson',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'CreatedBy',
            attributes: ['id', 'fs_name', 'ls_name', 'email'],
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

      return Responder({
        status: HttpStatusCode.Ok,
        data: lessondocument,
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
    createLessondocumentDto: CreateLessondocumentDto,
  ): Promise<ResponseServer> {
    try {
      // Validate input parameters
      if (!createLessondocumentDto.file_name || !createLessondocumentDto.url) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: 'File name and URL are required',
        });
      }

      // Verify that the lesson exists
      const lesson = await this.lessonModel.findByPk(
        createLessondocumentDto.id_lesson,
      );
      if (!lesson) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Lesson not found',
        });
      }

      // Create the lesson document
      const lessondocument = await this.lessondocumentModel.create({
        file_name: createLessondocumentDto.file_name,
        url: createLessondocumentDto.url,
        type: createLessondocumentDto.type,
        id_lesson: createLessondocumentDto.id_lesson,
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
              as: 'CreatedBy',
              attributes: ['id', 'fs_name', 'ls_name', 'email'],
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
    id: number,
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
              as: 'CreatedBy',
              attributes: ['id', 'fs_name', 'ls_name', 'email'],
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

  async remove(id: number): Promise<ResponseServer> {
    try {
      const lessondocument = await this.lessondocumentModel.findByPk(id);
      if (!lessondocument) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Lesson document not found',
        });
      }

      await lessondocument.destroy();

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
}
