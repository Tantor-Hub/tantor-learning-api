import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentTemplate } from '../models/model.documenttemplate';
import { DocumentInstance } from '../models/model.documentinstance';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { FillDocumentDto } from './dto/fill-document.dto';
import { Users } from '../models/model.users';
import { UserInSession } from '../models/model.userinsession';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentTemplate)
    private templateModel: typeof DocumentTemplate,
    @InjectModel(DocumentInstance)
    private instanceModel: typeof DocumentInstance,
    @InjectModel(Users)
    private usersModel: typeof Users,
    @InjectModel(UserInSession)
    private userInSessionModel: typeof UserInSession,
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

  private async checkStudentRole(userId: string): Promise<void> {
    console.log(
      '[DOCUMENTS SERVICE] 🔍 Checking student role for user:',
      userId,
    );
    const user = await this.usersModel.findByPk(userId);
    console.log(
      '[DOCUMENTS SERVICE] 👤 User found:',
      user ? { id: user.id, role: user.role } : 'Not found',
    );
    if (!user || user.role !== 'student') {
      console.log('[DOCUMENTS SERVICE] ❌ User is not a student or not found');
      throw new ForbiddenException(
        'Access denied. Only students can perform this action.',
      );
    }
    console.log('[DOCUMENTS SERVICE] ✅ User is a student');
  }

  /**
   * Check if user is enrolled in the session with status 'in'
   * Returns 402 error if user is not enrolled or status is not 'in'
   */
  private async checkUserInSession(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    console.log(
      '[DOCUMENTS SERVICE] 🔍 Checking if user is in session:',
      userId,
      'session:',
      sessionId,
    );

    const enrollment = await this.userInSessionModel.findOne({
      where: {
        id_user: userId,
        id_session: sessionId,
      },
    });

    if (!enrollment) {
      console.log('[DOCUMENTS SERVICE] ❌ User not enrolled in session');
      throw new HttpException(
        {
          statusCode: 402,
          message:
            "Accès refusé: Vous n'êtes pas inscrit à cette session. Veuillez contacter un administrateur pour vous inscrire.",
          error: 'Paiement requis',
        },
        402,
      );
    }

    if (enrollment.status !== 'in') {
      console.log(
        '[DOCUMENTS SERVICE] ❌ User enrollment status is not "in", current status:',
        enrollment.status,
      );
      const statusMap: { [key: string]: string } = {
        in: 'actif',
        out: 'inactif',
        pending: 'en attente',
        notpaid: 'non payé',
        refusedpayment: 'paiement refusé',
      };
      const statusInFrench = statusMap[enrollment.status] || enrollment.status;

      throw new HttpException(
        {
          statusCode: 402,
          message: `Accès refusé: Votre inscription à cette session est en statut "${statusInFrench}". Vous devez avoir le statut "actif" pour accéder à cette ressource. Veuillez contacter le secrétaire pour activer votre accès.`,
          error: 'Paiement requis',
        },
        402,
      );
    }

    console.log(
      '[DOCUMENTS SERVICE] ✅ User is enrolled and active in session',
    );
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
      signature: template.signature,
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
    if (dto.signature !== undefined) updateData.signature = dto.signature;

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

    // Check if user is a student
    await this.checkStudentRole(userId);

    // Check if an instance already exists for this user and template
    const existingInstance = await this.instanceModel.findOne({
      where: {
        userId,
        templateId: dto.templateId,
      },
    });

    // Generate filled content on the server if not provided, by replacing
    // {{variable}} placeholders in the TipTap JSON with provided values.
    const variableValues = (dto.variableValues as any) ?? {};
    let filledContent: any = dto.filledContent;
    if (!filledContent) {
      const raw = JSON.stringify(template.content ?? {});
      const replaced = raw.replace(/\{\{(.*?)\}\}/g, (_m, p1) => {
        const key = String(p1).trim();
        const val = variableValues[key];
        return val !== undefined && val !== null ? String(val) : '';
      });
      try {
        filledContent = JSON.parse(replaced);
      } catch {
        filledContent = template.content ?? {};
      }
    }

    let instance: DocumentInstance;
    if (existingInstance) {
      // Check if document is already validated - cannot modify
      if (existingInstance.status === 'validated') {
        throw new ForbiddenException(
          'Ce document est déjà validé et ne peut pas être modifié.',
        );
      }
      // If status is rejected or pending, reset to pending when user modifies
      if (
        existingInstance.status === 'rejected' ||
        existingInstance.status === 'pending'
      ) {
        existingInstance.status = 'pending';
      }
      // Update existing instance instead of creating a new one
      existingInstance.filledContent = filledContent;
      existingInstance.variableValues = variableValues;
      if (dto.is_published !== undefined) {
        existingInstance.is_published = dto.is_published;
      }
      if (dto.signature !== undefined) {
        existingInstance.signature = dto.signature;
      }
      await existingInstance.save();
      instance = existingInstance;
    } else {
      // Create new instance
      try {
        instance = await this.instanceModel.create({
          templateId: dto.templateId,
          userId,
          filledContent,
          variableValues,
          is_published: dto.is_published ?? false,
          signature: dto.signature ?? false,
        });
      } catch (error: any) {
        // Handle unique constraint violation (race condition)
        if (
          error.name === 'SequelizeUniqueConstraintError' ||
          error.message?.includes('unique_user_template')
        ) {
          throw new ConflictException(
            'A document instance already exists for this user and template',
          );
        }
        throw error;
      }
    }

    // Fetch with associations for response consistency
    const created = await this.instanceModel.findOne({
      where: { id: instance.id },
      include: [
        {
          model: DocumentTemplate,
          as: 'template',
          attributes: ['id', 'title', 'content'],
        },
      ],
    });
    return {
      status: 200,
      message: existingInstance
        ? 'Document updated successfully'
        : 'Document filled successfully',
      data: created,
    };
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
    is_published?: boolean,
    signature?: boolean,
  ) {
    const instance = await this.instanceModel.findOne({
      where: { id, userId },
      include: [
        {
          model: DocumentTemplate,
          as: 'template',
          attributes: ['id', 'sessionId', 'type'],
        },
      ],
    });
    if (!instance) throw new NotFoundException('Document instance not found');

    // Check if document is already validated - cannot modify
    if (instance.status === 'validated') {
      throw new ForbiddenException(
        'Ce document est déjà validé et ne peut pas être modifié.',
      );
    }

    // Check if user is enrolled in the session (status must be 'in')
    // Skip this check for templates with type 'before'
    if (instance.template.type !== 'before') {
      await this.checkUserInSession(userId, instance.template.sessionId);
    }

    // If status is rejected or pending, reset to pending when user modifies
    if (instance.status === 'rejected' || instance.status === 'pending') {
      instance.status = 'pending';
    }

    instance.filledContent = filledContent;
    if (variableValues !== undefined) {
      instance.variableValues = variableValues;
    }
    if (is_published !== undefined) {
      instance.is_published = is_published;
    }
    if (signature !== undefined) {
      instance.signature = signature;
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

  async getDocumentInstancesByTemplateForUser(
    templateId: string,
    userId: string,
  ) {
    const instances = await this.instanceModel.findAll({
      where: { templateId, userId },
      include: [
        {
          model: DocumentTemplate,
          as: 'template',
          attributes: ['id', 'title', 'content'],
        },
      ],
    });

    return {
      status: 200,
      message: 'Opération réussie.',
      data: instances,
    };
  }

  async getAllDocumentInstancesForSecretary(
    sessionId?: string,
    status?: 'pending' | 'validated' | 'rejected',
  ) {
    // Build where clause for instance filtering
    const instanceWhere: any = {
      is_published: true,
    };
    if (status) {
      instanceWhere.status = status;
    }

    // Build where clause for template filtering
    const templateWhere: any = {};
    if (sessionId) {
      templateWhere.sessionId = sessionId;
    }

    const includeOptions: any = [
      {
        model: DocumentTemplate,
        as: 'template',
        required: true,
        attributes: [
          'id',
          'title',
          'content',
          'sessionId',
          'type',
          'variables',
          'imageUrl',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: require('../models/model.trainingssession').TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: ['id', 'title', 'regulation_text'],
          },
        ],
        ...(Object.keys(templateWhere).length > 0
          ? { where: templateWhere }
          : {}),
      },
      {
        model: Users,
        as: 'user',
        required: false,
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    ];

    const instances = await this.instanceModel.findAll({
      where: instanceWhere,
      include: includeOptions,
      order: [['createdAt', 'DESC']],
    });

    return {
      status: 200,
      message: 'Document instances retrieved successfully',
      data: instances,
    };
  }

  async updateDocumentInstanceBySecretary(
    id: string,
    secretaryId: string,
    status?: 'pending' | 'validated' | 'rejected',
    comment?: string,
    signature?: boolean,
  ) {
    const instance = await this.instanceModel.findByPk(id, {
      include: [
        {
          model: DocumentTemplate,
          as: 'template',
          attributes: ['id', 'title', 'sessionId'],
        },
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!instance) {
      throw new NotFoundException('Document instance not found');
    }

    // Always update updatedBy with the secretary ID from the token
    // This ensures we track which secretary made the change, even if
    // it's the same secretary or only status/comment is being updated
    const updateData: any = {
      updatedBy: secretaryId,
    };

    // Update status if provided
    if (status !== undefined) {
      updateData.status = status;
    }

    // Update comment if provided (can be null to clear it)
    if (comment !== undefined) {
      updateData.comment = comment;
    }

    // Update signature if provided
    if (signature !== undefined) {
      updateData.signature = signature;
    }

    // Update the instance - updatedBy will always be set to the current secretary's ID
    await instance.update(updateData);

    // Reload the instance to get updated data with associations
    await instance.reload({
      include: [
        {
          model: DocumentTemplate,
          as: 'template',
          attributes: [
            'id',
            'title',
            'content',
            'sessionId',
            'type',
            'variables',
            'imageUrl',
          ],
          include: [
            {
              model: require('../models/model.trainingssession')
                .TrainingSession,
              as: 'trainingSession',
              attributes: ['id', 'title', 'regulation_text'],
            },
          ],
        },
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Users,
          as: 'updatedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
      ],
    });

    return {
      status: 200,
      message: 'Document instance updated successfully',
      data: instance,
    };
  }

  async getDocumentInstanceByIdForSecretary(id: string) {
    const instance = await this.instanceModel.findByPk(id, {
      include: [
        {
          model: DocumentTemplate,
          as: 'template',
          attributes: [
            'id',
            'title',
            'content',
            'sessionId',
            'type',
            'variables',
            'imageUrl',
            'createdAt',
            'updatedAt',
          ],
          include: [
            {
              model: require('../models/model.trainingssession')
                .TrainingSession,
              as: 'trainingSession',
              attributes: ['id', 'title', 'regulation_text'],
            },
          ],
        },
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Users,
          as: 'updatedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
      ],
    });

    if (!instance) {
      throw new NotFoundException('Document instance not found');
    }

    return {
      status: 200,
      message: 'Document instance retrieved successfully',
      data: instance,
    };
  }
}
