import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  LegalDocument,
  LegalDocumentType,
} from 'src/models/model.legaldocument';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { CreateLegalDocumentDto } from './dto/create-legal-document.dto';
import { UpdateLegalDocumentDto } from './dto/update-legal-document.dto';
import { Op } from 'sequelize';

@Injectable()
export class LegalDocumentsService {
  constructor(
    @InjectModel(LegalDocument)
    private readonly legalDocumentModel: typeof LegalDocument,
  ) {}

  async create(
    createDto: CreateLegalDocumentDto,
    userId: string,
  ): Promise<ResponseServer> {
    try {
      // Check if document of this type already exists
      const existing = await this.legalDocumentModel.findOne({
        where: { type: createDto.type },
      });

      if (existing) {
        return Responder({
          status: HttpStatusCode.Conflict,
          data: `Un document de type ${createDto.type} existe déjà. Chaque type de document ne peut exister qu'une seule fois. Utilisez l'endpoint de mise à jour pour modifier.`,
        });
      }

      const document = await this.legalDocumentModel.create({
        type: createDto.type,
        content: createDto.content || '',
        updatedBy: userId,
      });

      return Responder({
        status: HttpStatusCode.Created,
        data: document.toJSON(),
      });
    } catch (error) {
      // Catch unique constraint violation at database level
      if (error.name === 'SequelizeUniqueConstraintError') {
        return Responder({
          status: HttpStatusCode.Conflict,
          data: `Un document de type ${createDto.type} existe déjà. Chaque type de document ne peut exister qu'une seule fois.`,
        });
      }
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la création du document légal',
          details: error.message,
        },
      });
    }
  }

  async update(
    type: LegalDocumentType,
    updateDto: UpdateLegalDocumentDto,
    userId: string,
  ): Promise<ResponseServer> {
    try {
      // Use findOrCreate to ensure only one document per type exists
      const [document, created] = await this.legalDocumentModel.findOrCreate({
        where: { type },
        defaults: {
          type,
          content: updateDto.content || '',
          updatedBy: userId,
        },
      });

      // If document already existed, update it
      if (!created) {
        await document.update({
          content:
            updateDto.content !== undefined
              ? updateDto.content
              : document.content,
          updatedBy: userId,
        });
        // Reload to get updated data
        await document.reload();
      }

      return Responder({
        status: created ? HttpStatusCode.Created : HttpStatusCode.Ok,
        data: document.toJSON(),
      });
    } catch (error) {
      // Catch unique constraint violation at database level (shouldn't happen, but safety check)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return Responder({
          status: HttpStatusCode.Conflict,
          data: `Un document de type ${type} existe déjà. Chaque type de document ne peut exister qu'une seule fois.`,
        });
      }
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la mise à jour du document légal',
          details: error.message,
        },
      });
    }
  }

  async getAll(): Promise<ResponseServer> {
    try {
      const documents = await this.legalDocumentModel.findAll({
        order: [['type', 'ASC']],
        attributes: ['id', 'type', 'content', 'createdAt', 'updatedAt'],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: documents.map((doc) => doc.toJSON()),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la récupération des documents légaux',
          details: error.message,
        },
      });
    }
  }

  async getByType(type: LegalDocumentType): Promise<ResponseServer> {
    try {
      const document = await this.legalDocumentModel.findOne({
        where: { type },
      });

      if (!document) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: `Document de type ${type} non trouvé`,
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: document.toJSON(),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la récupération du document légal',
          details: error.message,
        },
      });
    }
  }

  async delete(type: LegalDocumentType): Promise<ResponseServer> {
    try {
      const document = await this.legalDocumentModel.findOne({
        where: { type },
      });

      if (!document) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: `Document de type ${type} non trouvé`,
        });
      }

      await document.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          message: `Document de type ${type} supprimé avec succès`,
        },
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la suppression du document légal',
          details: error.message,
        },
      });
    }
  }
}
