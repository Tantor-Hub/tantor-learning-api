import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModuleDeFormation } from 'src/models/model.moduledeformation';
import { CreateModuleDeFormationDto } from './dto/create-moduledeformation.dto';
import { UpdateModuleDeFormationDto } from './dto/update-moduledeformation.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { AllSercices } from 'src/services/serices.all';

@Injectable()
export class ModuleDeFormationService {
  constructor(
    @InjectModel(ModuleDeFormation)
    private readonly moduleDeFormationModel: typeof ModuleDeFormation,
    private readonly allServices: AllSercices,
  ) {}

  async create(
    createDto: CreateModuleDeFormationDto,
    piece_jointe: string,
  ): Promise<any> {
    try {
      const module = await this.moduleDeFormationModel.create({
        ...createDto,
        piece_jointe,
      });

      // Exclude id from the response
      const { id, ...moduleWithoutId } = module.toJSON();

      return Responder({
        status: HttpStatusCode.Created,
        data: moduleWithoutId,
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async findAll(): Promise<any> {
    try {
      const modules = await this.moduleDeFormationModel.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });
      return Responder({
        status: HttpStatusCode.Ok,
        data: { length: modules.length, rows: modules },
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async update(
    id: string,
    updateDto: UpdateModuleDeFormationDto,
    piece_jointe?: string,
  ): Promise<any> {
    try {
      // Check if module exists
      const existingModule = await this.moduleDeFormationModel.findOne({
        where: { id },
      });

      if (!existingModule) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'ModuleDeFormation not found',
        });
      }

      // Prepare update data
      const updateData: any = { ...updateDto };
      if (piece_jointe) {
        updateData.piece_jointe = piece_jointe;
      }

      // Update the module
      await this.moduleDeFormationModel.update(updateData, {
        where: { id },
      });

      // Fetch the updated module
      const updatedModule = await this.moduleDeFormationModel.findOne({
        where: { id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      if (!updatedModule) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'ModuleDeFormation not found after update',
        });
      }

      // Exclude id from the response
      const { id: moduleId, ...moduleWithoutId } = updatedModule.toJSON();

      return Responder({
        status: HttpStatusCode.Ok,
        data: moduleWithoutId,
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
}
