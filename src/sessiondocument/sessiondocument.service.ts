import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SessionDocument } from 'src/models/model.sessiondocument';
import { Users } from 'src/models/model.users';
import { TrainingSession } from 'src/models/model.trainingssession';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { CreateSessionDocumentDto } from './dto/create-sessiondocument.dto';
import { UpdateSessionDocumentDto } from './dto/update-sessiondocument.dto';
import { UpdateSessionDocumentSecretaryDto } from './dto/update-sessiondocument-secretary.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';

@Injectable()
export class SessionDocumentService {
  constructor(
    @InjectModel(SessionDocument)
    private sessionDocumentModel: typeof SessionDocument,
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(TrainingSession)
    private trainingSessionModel: typeof TrainingSession,
  ) {}

  async create(
    createSessionDocumentDto: CreateSessionDocumentDto,
    user: IJwtSignin,
  ): Promise<ResponseServer> {
    console.log('data sent from the front', createSessionDocumentDto);
    try {
      // Validate that the student exists
      const student = await this.userModel.findOne({
        where: { id: user.id_user },
      });
      if (!student) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Student not found',
        });
      }
      // Validate that the training session exists
      const trainingSession = await this.trainingSessionModel.findByPk(
        createSessionDocumentDto.id_session,
      );
      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Training session not found',
        });
      }

      // Check if a document with the same type already exists for this student and session
      const existingDocument = await this.sessionDocumentModel.findOne({
        where: {
          id_student: user.id_user,
          id_session: createSessionDocumentDto.id_session,
          type: createSessionDocumentDto.type,
        },
      });

      if (existingDocument) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: `A document of type "${createSessionDocumentDto.type}" already exists for this session`,
        });
      }

      const sessionDocument = await this.sessionDocumentModel.create({
        ...createSessionDocumentDto,
        id_student: user.id_user,
        status: 'pending',
      });

      return Responder({
        status: HttpStatusCode.Created,
        data: sessionDocument,
        customMessage: 'Session document created successfully',
      });
    } catch (error) {
      console.error('Error creating session document:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error creating session document',
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const sessionDocuments = await this.sessionDocumentModel.findAll({
        include: [
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionDocuments,
        customMessage: 'Session documents retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving session documents:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving session documents',
      });
    }
  }

  async findAllForSecretary(
    status?: 'pending' | 'rejected' | 'validated',
    sessionId?: string,
  ): Promise<ResponseServer> {
    try {
      const whereClause: any = {};

      // Add status filter if provided
      if (status) {
        whereClause.status = status;
      }

      // Add session ID filter if provided
      if (sessionId) {
        whereClause.id_session = sessionId;
      }

      const sessionDocuments = await this.sessionDocumentModel.findAll({
        where: whereClause,
        include: [
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionDocuments,
        customMessage: 'Session documents retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving session documents for secretary:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving session documents',
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const sessionDocument = await this.sessionDocumentModel.findByPk(id, {
        include: [
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
        ],
      });

      if (!sessionDocument) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session document not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionDocument,
        customMessage: 'Session document retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving session document:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving session document',
      });
    }
  }

  async update(
    user: IJwtSignin,
    id: string,
    updateSessionDocumentDto: UpdateSessionDocumentDto,
  ): Promise<ResponseServer> {
    try {
      const sessionDocument = await this.sessionDocumentModel.findByPk(id);
      if (!sessionDocument) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session document not found',
        });
      }

      // If updating training session, validate that the training session exists
      if (updateSessionDocumentDto.id_session) {
        const trainingSession = await this.trainingSessionModel.findByPk(
          updateSessionDocumentDto.id_session,
        );
        if (!trainingSession) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: 'Training session not found',
          });
        }
      }

      // If updating type, check if another document with the same type already exists
      // for this student and session (excluding the current document)
      if (updateSessionDocumentDto.type) {
        const targetSessionId =
          updateSessionDocumentDto.id_session || sessionDocument.id_session;
        const existingDocument = await this.sessionDocumentModel.findOne({
          where: {
            id_student: sessionDocument.id_student,
            id_session: targetSessionId,
            type: updateSessionDocumentDto.type,
          },
        });

        // If a document with the same type exists and it's not the current document
        if (existingDocument && existingDocument.id !== id) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: `A document of type "${updateSessionDocumentDto.type}" already exists for this session`,
          });
        }
      }

      await sessionDocument.update(updateSessionDocumentDto);

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionDocument,
        customMessage: 'Session document updated successfully',
      });
    } catch (error) {
      console.error('Error updating session document:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error updating session document',
      });
    }
  }

  async remove(id: string): Promise<ResponseServer> {
    try {
      const sessionDocument = await this.sessionDocumentModel.findByPk(id);
      if (!sessionDocument) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session document not found',
        });
      }

      await sessionDocument.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        customMessage: 'Session document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting session document:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error deleting session document',
      });
    }
  }

  async findByStudentId(studentId: string): Promise<ResponseServer> {
    try {
      const sessionDocuments = await this.sessionDocumentModel.findAll({
        where: { id_student: studentId },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionDocuments,
        customMessage: 'Session documents retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving session documents by student:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving session documents',
      });
    }
  }

  async findBySessionId(sessionId: string): Promise<ResponseServer> {
    try {
      const sessionDocuments = await this.sessionDocumentModel.findAll({
        where: { id_session: sessionId },
        include: [
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionDocuments,
        customMessage: 'Session documents retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving session documents by session:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving session documents',
      });
    }
  }

  async findByStudentAndSessionId(
    studentId: string,
    sessionId: string,
    category?: 'before' | 'during' | 'after',
  ): Promise<ResponseServer> {
    try {
      const whereClause: any = {
        id_student: studentId,
        id_session: sessionId,
      };

      // Add category filter if provided
      if (category) {
        whereClause.categories = category;
      }

      const sessionDocuments = await this.sessionDocumentModel.findAll({
        where: whereClause,
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionDocuments,
        customMessage: 'Session documents retrieved successfully',
      });
    } catch (error) {
      console.error(
        'Error retrieving session documents by student and session:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving session documents',
      });
    }
  }

  async updateBySecretary(
    id: string,
    updateDto: UpdateSessionDocumentSecretaryDto,
  ): Promise<ResponseServer> {
    try {
      const sessionDocument = await this.sessionDocumentModel.findByPk(id);
      if (!sessionDocument) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session document not found',
        });
      }

      // Update only status and/or comment
      const updateData: any = {};
      if (updateDto.status !== undefined) {
        updateData.status = updateDto.status;
      }
      if (updateDto.comment !== undefined) {
        updateData.comment = updateDto.comment;
      }

      await sessionDocument.update(updateData);

      // Reload the document to get updated data
      await sessionDocument.reload({
        include: [
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
        ],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionDocument,
        customMessage: 'Session document updated successfully',
      });
    } catch (error) {
      console.error('Error updating session document by secretary:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error updating session document',
      });
    }
  }
}
