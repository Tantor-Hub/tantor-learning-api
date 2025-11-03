import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CatalogueFormation } from 'src/models/model.catalogueformation';
import { Users } from 'src/models/model.users';
import { CreateCatalogueFormationDto } from './dto/create-catalogueformation.dto';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { Responder } from 'src/strategy/strategy.responder';
import { ResponseServer } from 'src/interface/interface.response';
import { HttpStatusCode } from 'src/config/config.statuscodes';

@Injectable()
export class CatalogueFormationService {
  constructor(
    @InjectModel(CatalogueFormation)
    private readonly catalogueFormationModel: typeof CatalogueFormation,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async create(
    createDto: CreateCatalogueFormationDto,
    userId: string,
  ): Promise<CatalogueFormation> {
    return this.catalogueFormationModel.create({
      ...createDto,
      createdBy: userId,
    });
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

  async update(
    id: string,
    updateDto: Partial<CreateCatalogueFormationDto>,
  ): Promise<CatalogueFormation | null> {
    const catalogue = await this.findOne(id);
    if (catalogue) {
      await catalogue.update(updateDto);
      return catalogue.reload();
    }
    return null;
  }

  async remove(id: string): Promise<void> {
    const catalogue = await this.findOne(id);
    if (catalogue) {
      await catalogue.destroy();
    }
  }
}
