import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Training } from '../models/model.trainings';
import { CreateTrainingsDto } from './dto/create-trainings.dto';
import { UpdateTrainingsDto } from './dto/update-trainings.dto';
import { DeleteTrainingsDto } from './dto/delete-trainings.dto';
import { Responder } from '../strategy/strategy.responder';
import { HttpStatusCode } from '../config/config.statuscodes';
import { TrainingCategory } from '../models/model.trainingcategory';
import { DataType } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';
import { tables } from '../config/config.tablesname';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectModel(Training)
    private trainingModel: typeof Training,
  ) {}

  async create(createTrainingsDto: CreateTrainingsDto) {
    try {
      console.log(
        '[TRAININGS CREATE] Starting creation with data:',
        createTrainingsDto,
      );

      const training = await this.trainingModel.create(createTrainingsDto);

      // Fetch the created training with relationships
      const createdTraining = await this.trainingModel.findByPk(training.id, {
        include: [
          {
            model: TrainingCategory,
            as: 'trainingCategory',
            required: false,
            attributes: ['title'],
          },
        ],
      });

      if (!createdTraining) {
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: null,
          customMessage: 'Failed to retrieve created training',
        });
      }

      console.log(
        '[TRAININGS CREATE] ✅ Successfully created training:',
        createdTraining.toJSON(),
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: createdTraining,
        customMessage: 'Training created successfully',
      });
    } catch (error) {
      console.error('[TRAININGS CREATE] ❌ Error creating training:');
      console.error('[TRAININGS CREATE] Error message:', error.message);
      console.error('[TRAININGS CREATE] Error stack:', error.stack);
      console.error('[TRAININGS CREATE] Full error object:', error);
      console.error('[TRAININGS CREATE] Request data:', createTrainingsDto);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          originalError: error.original || null,
        },
        customMessage: 'Failed to create training',
      });
    }
  }

  async findAll() {
    try {
      const trainings = await this.trainingModel.findAll({
        include: [
          {
            model: TrainingCategory,
            as: 'trainingCategory',
            required: false,
            attributes: ['title'],
          },
        ],
      });
      return Responder({
        status: HttpStatusCode.Ok,
        data: trainings,
        customMessage: 'Trainings retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve trainings',
      });
    }
  }

  async findOne(id: string) {
    try {
      const training = await this.trainingModel.findByPk(id, {
        include: [
          {
            model: TrainingCategory,
            as: 'trainingCategory',
            required: false,
            attributes: ['title'],
          },
        ],
      });

      if (!training) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Training not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: training,
        customMessage: 'Training retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve training',
      });
    }
  }

  async update(updateTrainingsDto: UpdateTrainingsDto) {
    try {
      const { id, ...updateData } = updateTrainingsDto;

      const [affectedCount] = await this.trainingModel.update(updateData, {
        where: { id },
      });

      if (affectedCount === 0) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Training not found',
        });
      }

      const updatedTraining = await this.trainingModel.findByPk(id, {
        include: [
          {
            model: TrainingCategory,
            as: 'trainingCategory',
            required: false,
            attributes: ['title'],
          },
        ],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: updatedTraining,
        customMessage: 'Training updated successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to update training',
      });
    }
  }

  async remove(deleteTrainingsDto: DeleteTrainingsDto) {
    try {
      const { id } = deleteTrainingsDto;

      const deletedCount = await this.trainingModel.destroy({
        where: { id },
      });

      if (deletedCount === 0) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Training not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id },
        customMessage: 'Training deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to delete training',
      });
    }
  }

  async deleteAll() {
    try {
      const deletedCount = await this.trainingModel.destroy({
        where: {},
        truncate: true,
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: { deletedCount },
        customMessage: 'All trainings deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to delete all trainings',
      });
    }
  }

  async createTableIfNotExists() {
    try {
      if (!this.trainingModel.sequelize) {
        throw new Error('Sequelize instance not available');
      }

      const queryInterface: QueryInterface =
        this.trainingModel.sequelize.getQueryInterface();
      const tableName = tables['training'];

      console.log(`[TRAININGS CREATE TABLE] Checking table: ${tableName}`);

      // Check if table exists
      const tableExists = await queryInterface.tableExists(tableName);
      if (!tableExists) {
        console.log(
          `[TRAININGS CREATE TABLE] Table ${tableName} does not exist, creating it...`,
        );

        await queryInterface.createTable(tableName, {
          id: {
            type: DataType.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataType.UUIDV4,
          },
          title: {
            type: DataType.STRING,
            allowNull: false,
          },
          subtitle: {
            type: DataType.STRING,
            allowNull: true,
          },
          id_trainingcategory: {
            type: DataType.UUID,
            allowNull: true,
          },
          trainingtype: {
            type: DataType.ENUM(
              'En ligne',
              'Vision Conférence',
              'En présentiel',
              'Hybride',
            ),
            allowNull: true,
          },
          rnc: {
            type: DataType.STRING,
            allowNull: true,
          },
          description: {
            type: DataType.TEXT,
            allowNull: true,
          },
          requirement: {
            type: DataType.TEXT,
            allowNull: true,
          },
          pedagogygoals: {
            type: DataType.TEXT,
            allowNull: true,
          },
          prix: {
            type: DataType.DECIMAL(10, 2),
            allowNull: true,
          },
          createdAt: {
            type: DataType.DATE,
            allowNull: true,
          },
          updatedAt: {
            type: DataType.DATE,
            allowNull: true,
          },
        });

        console.log(
          `[TRAININGS CREATE TABLE] ✅ Table ${tableName} created successfully`,
        );
        return Responder({
          status: HttpStatusCode.Ok,
          data: { tableName },
          customMessage: 'Training table created successfully',
        });
      }

      console.log(`[TRAININGS CREATE TABLE] Table ${tableName} already exists`);
      return Responder({
        status: HttpStatusCode.Ok,
        data: { tableName },
        customMessage: 'Training table already exists',
      });
    } catch (error) {
      console.error('[TRAININGS CREATE TABLE] Error:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to create training table',
      });
    }
  }
}
