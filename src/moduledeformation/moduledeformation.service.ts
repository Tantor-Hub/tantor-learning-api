import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModuleDeFormation } from 'src/models/model.moduledeformation';
import { CreateModuleDeFormationDto } from './dto/create-moduledeformation.dto';
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
      const uuid = this.allServices.generateUuid();
      const module = await this.moduleDeFormationModel.create({
        ...createDto,
        uuid,
        piece_jointe,
      });
      return Responder({ status: HttpStatusCode.Created, data: module });
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

  async findOne(id: string): Promise<any> {
    try {
      const module = await this.moduleDeFormationModel.findOne({
        where: { id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });
      if (!module) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'ModuleDeFormation not found',
        });
      }
      return Responder({ status: HttpStatusCode.Ok, data: module });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
}
