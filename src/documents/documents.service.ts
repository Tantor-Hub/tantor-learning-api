import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentTemplate } from '../models/model.documenttemplate';
import { DocumentInstance } from '../models/model.documentinstance';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { FillDocumentDto } from './dto/fill-document.dto';
import { Users } from '../models/model.users';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentTemplate)
    private templateModel: typeof DocumentTemplate,
    @InjectModel(DocumentInstance)
    private instanceModel: typeof DocumentInstance,
    @InjectModel(Users)
    private usersModel: typeof Users,
  ) {}

  private async checkSecretaryRole(userId: string): Promise<void> {
    console.log(
      '[DOCUMENTS SERVICE] 🔍 Checking secretary role for user:',
      userId,
    );
    const user = await this.usersModel.findByPk(userId);
    console.log(
      '[DOCUMENTS SERVICE] 👤 User found:',
      user ? { id: user.id, role: user.role } : 'Not found',
    );
    if (!user || user.role !== 'secretary') {
      console.log(
        '[DOCUMENTS SERVICE] ❌ User is not a secretary or not found',
      );
      throw new ForbiddenException(
        'Access denied. Only secretaries can perform this action.',
      );
    }
    console.log('[DOCUMENTS SERVICE] ✅ User is a secretary');
  }

  async createTemplate(dto: CreateTemplateDto, userId: string) {
    console.log('[DOCUMENTS SERVICE] 📝 Creating template for user:', userId);
    console.log('[DOCUMENTS SERVICE] 📝 Template data:', dto);

    await this.checkSecretaryRole(userId);
    console.log('[DOCUMENTS SERVICE] ✅ User is secretary');

    const template = await this.templateModel.create({
      ...dto,
      createdById: userId,
    });
    console.log('[DOCUMENTS SERVICE] ✅ Template created:', template.id);

    // Return only the necessary fields, excluding createdById since it comes from token
    return {
      id: template.id,
      title: template.title,
      content: template.content,
      sessionId: template.sessionId,
      type: template.type,
      imageUrl: template.imageUrl,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  async updateTemplate(
    templateId: string,
    dto: UpdateTemplateDto,
    userId: string,
  ) {
    console.log(
      '[DOCUMENTS SERVICE] 📝 Updating template:',
      templateId,
      'for user:',
      userId,
    );
    console.log('[DOCUMENTS SERVICE] 📝 Update data:', dto);

    await this.checkSecretaryRole(userId);
    console.log('[DOCUMENTS SERVICE] ✅ User is secretary');

    // Find the template and verify ownership
    const template = await this.templateModel.findOne({
      where: { id: templateId, createdById: userId },
    });

    if (!template) {
      console.log(
        '[DOCUMENTS SERVICE] ❌ Template not found or user not authorized',
      );
      throw new NotFoundException(
        'Template not found or you do not have permission to update it',
      );
    }

    // Update only the provided fields
    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.variables !== undefined) updateData.variables = dto.variables;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;

    await template.update(updateData);
    console.log('[DOCUMENTS SERVICE] ✅ Template updated:', template.id);

    // Return the updated template with related data
    const updatedTemplate = await this.templateModel.findByPk(templateId, {
      include: [
        {
          model: require('../models/model.users').Users,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: require('../models/model.trainingssession').TrainingSession,
          as: 'trainingSession',
          attributes: ['id', 'title', 'regulation_text'],
        },
      ],
    });

    return {
      status: 200,
      message: 'Template updated successfully',
      data: updatedTemplate,
    };
  }

  async getAllTemplates() {
    const templates = await this.templateModel.findAll({
      include: [
        {
          model: require('../models/model.users').Users,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: require('../models/model.trainingssession').TrainingSession,
          as: 'trainingSession',
          attributes: ['id', 'title', 'regulation_text'],
        },
      ],
    });

    return {
      status: 200,
      message: 'Templates retrieved successfully',
      data: templates,
    };
  }

  async getTemplateById(id: string) {
    const template = await this.templateModel.findByPk(id, {
      include: [
        {
          model: require('../models/model.users').Users,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: require('../models/model.trainingssession').TrainingSession,
          as: 'trainingSession',
          attributes: ['id', 'title', 'regulation_text'],
        },
      ],
    });
    if (!template) throw new NotFoundException('Template not found');

    return {
      status: 200,
      message: 'Template retrieved successfully',
      data: template,
    };
  }

  async getTemplatesBySessionId(sessionId: string) {
    console.log(
      '[DOCUMENTS SERVICE] 🔍 Getting templates for session:',
      sessionId,
    );

    const templates = await this.templateModel.findAll({
      where: { sessionId },
      include: [
        {
          model: require('../models/model.users').Users,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: require('../models/model.trainingssession').TrainingSession,
          as: 'trainingSession',
          attributes: ['id', 'title', 'regulation_text'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    console.log('[DOCUMENTS SERVICE] 📋 Found templates:', templates.length);

    return {
      status: 200,
      message: 'Templates retrieved successfully',
      data: templates,
    };
  }

  async fillDocument(dto: FillDocumentDto, userId: string) {
    // Verify template exists
    const template = await this.templateModel.findByPk(dto.templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return await this.instanceModel.create({
      templateId: dto.templateId,
      userId,
      filledContent: dto.filledContent,
      variableValues: dto.variableValues,
    });
  }

  async getUserDocuments(userId: string) {
    return await this.instanceModel.findAll({
      where: { userId },
      include: [
        {
          model: DocumentTemplate,
          as: 'template',
          attributes: ['id', 'title', 'content'],
        },
      ],
    });
  }

  async getDocumentInstanceById(id: string, userId: string) {
    const instance = await this.instanceModel.findOne({
      where: { id, userId },
      include: [
        {
          model: DocumentTemplate,
          as: 'template',
          attributes: ['id', 'title', 'content'],
        },
      ],
    });
    if (!instance) throw new NotFoundException('Document instance not found');
    return instance;
  }

  async updateDocumentInstance(
    id: string,
    userId: string,
    filledContent: object,
    variableValues?: object,
  ) {
    const instance = await this.instanceModel.findOne({
      where: { id, userId },
    });
    if (!instance) throw new NotFoundException('Document instance not found');

    instance.filledContent = filledContent;
    if (variableValues !== undefined) {
      instance.variableValues = variableValues;
    }
    await instance.save();
    return instance;
  }

  async deleteDocumentInstance(id: string, userId: string) {
    const instance = await this.instanceModel.findOne({
      where: { id, userId },
    });
    if (!instance) throw new NotFoundException('Document instance not found');

    await instance.destroy();
    return { message: 'Document instance deleted successfully' };
  }

  async deleteTemplate(id: string, userId: string) {
    await this.checkSecretaryRole(userId);

    const template = await this.templateModel.findOne({
      where: { id, createdById: userId },
    });
    if (!template) throw new NotFoundException('Template not found');

    // Delete all instances first
    await this.instanceModel.destroy({ where: { templateId: id } });

    await template.destroy();
    return { message: 'Template deleted successfully' };
  }
}
