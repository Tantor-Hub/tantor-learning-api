import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CatalogueFormation } from 'src/models/model.catalogueformation';
import { Users } from 'src/models/model.users';
import { CreateCatalogueFormationDto } from './dto/create-catalogueformation.dto';
import { CreateStudentCatalogueDto } from './dto/create-student-catalogue.dto';
import { UpdateStudentCatalogueDto } from './dto/update-student-catalogue.dto';
import { CatalogueType } from 'src/interface/interface.catalogueformation';
import { CloudinaryService } from 'src/services/service.cloudinary';
import { Responder } from 'src/strategy/strategy.responder';
import { ResponseServer } from 'src/interface/interface.response';
import { HttpStatusCode } from 'src/config/config.statuscodes';

@Injectable()
export class CatalogueFormationService {
  constructor(
    @InjectModel(CatalogueFormation)
    private readonly catalogueFormationModel: typeof CatalogueFormation,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createDto: CreateCatalogueFormationDto,
    userId: string,
  ): Promise<CatalogueFormation> {
    if (createDto.type !== CatalogueType.STUDENT) {
      // Check uniqueness only for non-student catalogues
      const whereClause: any = { type: createDto.type };
      whereClause.id_training = null;

      const existingCatalogue = await this.catalogueFormationModel.findOne({
        where: whereClause,
      });

      if (existingCatalogue) {
        throw new ConflictException(
          `Un catalogue de formation de type "${createDto.type}" sans id_training existe déjà.`,
        );
      }
    }

    try {
      return await this.catalogueFormationModel.create({
        ...createDto,
        createdBy: userId,
      });
    } catch (error: any) {
      // Handle unique constraint violation at database level (safety check)
      if (
        error.name === 'SequelizeUniqueConstraintError' ||
        error.message?.includes('unique_catalogue_type_training')
      ) {
        throw new ConflictException(
          `Un catalogue de formation de type "${createDto.type}" existe déjà avec cette combinaison de type et id_training.`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      console.log('Fetching all catalogue formations');
      const catalogues = await this.catalogueFormationModel.findAll({
        include: [
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      const catalogueformations = catalogues.map((catalogue) => {
        return catalogue.toJSON();
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          catalogueformations: catalogueformations,
          total: catalogueformations.length,
        },
        customMessage: 'Catalogue formations retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching catalogue formations:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while fetching catalogue formations',
          error: error.message,
        },
      });
    }
  }

  async findByType(type: string): Promise<CatalogueFormation[]> {
    return this.catalogueFormationModel.findAll({
      where: { type },
      include: [
        {
          model: Users,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  async findOneByType(type: string): Promise<ResponseServer> {
    try {
      console.log(`Fetching catalogue formation for type: ${type}`);
      const catalogue = await this.catalogueFormationModel.findOne({
        where: { type },
        include: [
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      if (!catalogue) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: `Catalogue formation for type '${type}' not found`,
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: catalogue.toJSON(),
        customMessage: `Catalogue formation for ${type} retrieved successfully`,
      });
    } catch (error) {
      console.error(
        `Error fetching catalogue formation for type ${type}:`,
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: `Internal server error while fetching catalogue formation for ${type}`,
          error: error.message,
        },
      });
    }
  }

  async findOne(id: string): Promise<CatalogueFormation | null> {
    return this.catalogueFormationModel.findByPk(id, {
      include: [
        {
          model: Users,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  async findByTrainingId(trainingId: string): Promise<CatalogueFormation[]> {
    return this.catalogueFormationModel.findAll({
      where: { id_training: trainingId },
      include: [
        {
          model: Users,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findByTrainingIdAndType(
    trainingId: string,
    type: CatalogueType,
  ): Promise<CatalogueFormation[]> {
    return this.catalogueFormationModel.findAll({
      where: { id_training: trainingId, type },
      include: [
        {
          model: Users,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async update(
    id: string,
    updateDto: Partial<CreateCatalogueFormationDto>,
  ): Promise<CatalogueFormation | null> {
    const catalogue = await this.findOne(id);
    if (!catalogue) {
      return null;
    }

    // If type is being updated, check if another catalogue with that type and same id_training exists
    if (updateDto.type && updateDto.type !== catalogue.type) {
      const whereClause: any = { 
        type: updateDto.type,
        id: { [Op.ne]: id }, // Exclude current catalogue
      };
      // Use the existing id_training from the catalogue (since updateDto doesn't have it)
      whereClause.id_training = catalogue.id_training || null;

      const existingCatalogue = await this.catalogueFormationModel.findOne({
        where: whereClause,
      });

      if (existingCatalogue) {
        throw new ConflictException(
          `Un catalogue de formation de type "${updateDto.type}" existe déjà avec cette combinaison de type et id_training.`,
        );
      }
    }

    try {
      await catalogue.update(updateDto);
      return catalogue.reload();
    } catch (error: any) {
      // Handle unique constraint violation at database level
      if (
        error.name === 'SequelizeUniqueConstraintError' ||
        error.message?.includes('unique_catalogue_type_training')
      ) {
        throw new ConflictException(
          `Un catalogue de formation de type "${updateDto.type || catalogue.type}" existe déjà avec cette combinaison de type et id_training.`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const catalogue = await this.findOne(id);
    if (catalogue) {
      await catalogue.destroy();
    }
  }

  async createStudentCatalogue(
    createDto: CreateStudentCatalogueDto,
    userId: string,
  ): Promise<CatalogueFormation> {
    try {
      return await this.catalogueFormationModel.create({
        type: CatalogueType.STUDENT,
        title: createDto.title,
        description: createDto.description,
        piece_jointe: createDto.piece_jointe,
        id_training: createDto.id_training,
        createdBy: userId,
      });
    } catch (error: any) {
      // Handle unique constraint violation at database level (safety check)
      if (
        error.name === 'SequelizeUniqueConstraintError' ||
        error.message?.includes('unique_catalogue_type_training')
      ) {
        throw new ConflictException(
          createDto.id_training
            ? `Un catalogue de formation de type "student" avec l'id_training "${createDto.id_training}" existe déjà.`
            : 'Un catalogue de formation de type "student" sans id_training existe déjà.',
        );
      }
      throw error;
    }
  }

  async updateStudentCatalogue(
    id: string,
    updateDto: UpdateStudentCatalogueDto,
  ): Promise<CatalogueFormation> {
    // Find the catalogue by ID
    const catalogue = await this.catalogueFormationModel.findByPk(id);

    if (!catalogue) {
      throw new NotFoundException(
        'Catalogue de formation non trouvé.',
      );
    }

    // Verify it's a student type catalogue
    if (catalogue.type !== CatalogueType.STUDENT) {
      throw new ForbiddenException(
        'Ce catalogue n\'est pas de type "student".',
      );
    }

    try {
      // Update only provided fields
      const updateData: any = {};
      if (updateDto.title !== undefined) updateData.title = updateDto.title;
      if (updateDto.description !== undefined)
        updateData.description = updateDto.description;
      if (updateDto.id_training !== undefined)
        updateData.id_training = updateDto.id_training;
      if (updateDto.piece_jointe !== undefined)
        updateData.piece_jointe = updateDto.piece_jointe;

      await catalogue.update(updateData);
      return catalogue.reload();
    } catch (error: any) {
      // Handle unique constraint violation at database level
      if (
        error.name === 'SequelizeUniqueConstraintError' ||
        error.message?.includes('unique_catalogue_type_training')
      ) {
        throw new ConflictException(
          updateDto.id_training
            ? `Un catalogue de formation de type "student" avec l'id_training "${updateDto.id_training}" existe déjà.`
            : 'Un catalogue de formation de type "student" sans id_training existe déjà.',
        );
      }
      throw error;
    }
  }
}
