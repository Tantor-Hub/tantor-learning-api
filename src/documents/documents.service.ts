import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Document } from 'src/models/model.document';
import { DocumentField } from 'src/models/model.documentfield';
import { DocumentResponse } from 'src/models/model.documentresponse';
import { Users } from 'src/models/model.users';
import { CreateDocumentDto } from './dto/create-document.dto';
import { AddFieldsDto } from './dto/add-fields.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { GoogleDriveService } from 'src/services/service.googledrive';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document) private readonly documentModel: typeof Document,
    @InjectModel(DocumentField)
    private readonly fieldModel: typeof DocumentField,
    @InjectModel(DocumentResponse)
    private readonly responseModel: typeof DocumentResponse,
    @InjectModel(Users) private readonly usersModel: typeof Users,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async createDocument(dto: CreateDocumentDto) {
    const created = await this.documentModel.create({
      title: dto.title,
      description: dto.description,
      content: dto.content,
      createdBy: dto.createdBy,
    });
    return created;
  }

  async addFields(documentId: string, dto: AddFieldsDto) {
    const rows = dto.fields.map((f) => ({ ...f, documentId }));
    const created = await this.fieldModel.bulkCreate(rows);
    return created;
  }

  async getDocument(id: string) {
    const doc = await this.documentModel.findByPk(id, {
      include: [{ model: DocumentField, as: 'fields', required: false }],
    });
    return doc;
  }

  async submitResponse(documentId: string, dto: SubmitResponseDto) {
    const saved = await this.responseModel.create({
      documentId,
      userId: dto.userId,
      answers: dto.answers,
      submittedAt: new Date(),
    });
    return saved;
  }

  async getResponses(documentId: string) {
    return this.responseModel.findAll({
      where: { documentId },
      include: [{ model: Users, as: 'user', required: false }],
      order: [['createdAt', 'DESC']],
    });
  }

  async uploadSignatureImage(file: Express.Multer.File) {
    const uploaded = await this.googleDriveService.uploadBufferFile(file);
    return uploaded;
  }
}
