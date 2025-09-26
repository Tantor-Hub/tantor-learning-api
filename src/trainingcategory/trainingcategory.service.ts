import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { TrainingCategory } from 'src/models/model.trainingcategory';
import { Responder } from 'src/strategy/strategy.responder';
import { CreateTrainingCategoryDto } from './dto/create-trainingcategory.dto';
import { UpdateTrainingCategoryDto } from './dto/update-trainingcategory.dto';
import { DeleteTrainingCategoryDto } from './dto/delete-trainingcategory.dto';

@Injectable()
export class TrainingCategoryService {
  constructor(
    @InjectModel(TrainingCategory)
    private readonly trainingCategoryModel: typeof TrainingCategory,
  ) {}

  async create(
    createTrainingCategoryDto: CreateTrainingCategoryDto,
  ): Promise<ResponseServer> {
    try {
      console.log(
        '[TRAININGCATEGORY CREATE] Starting creation with data:',
        createTrainingCategoryDto,
      );

      const trainingCategory = await this.trainingCategoryModel.create(
        createTrainingCategoryDto,
      );

      console.log(
        '[TRAININGCATEGORY CREATE] ✅ Successfully created training category:',
        trainingCategory.toJSON(),
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: trainingCategory,
        customMessage: 'Training category created successfully',
      });
    } catch (error) {
      console.error(
        '[TRAININGCATEGORY CREATE] ❌ Error creating training category:',
      );
      console.error('[TRAININGCATEGORY CREATE] Error message:', error.message);
      console.error('[TRAININGCATEGORY CREATE] Error stack:', error.stack);
      console.error('[TRAININGCATEGORY CREATE] Full error object:', error);
      console.error(
        '[TRAININGCATEGORY CREATE] Request data:',
        createTrainingCategoryDto,
      );

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          originalError: error.original || null,
        },
        customMessage: 'Failed to create training category',
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      console.log(
        '[TRAININGCATEGORY FINDALL] Starting to retrieve all training categories',
      );

      const trainingCategories = await this.trainingCategoryModel.findAll({
        order: [['title', 'ASC']],
      });

      console.log(
        '[TRAININGCATEGORY FINDALL] ✅ Successfully retrieved training categories:',
        trainingCategories.length,
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: trainingCategories,
        customMessage: 'Training categories retrieved successfully',
      });
    } catch (error) {
      console.error(
        '[TRAININGCATEGORY FINDALL] ❌ Error retrieving training categories:',
      );
      console.error('[TRAININGCATEGORY FINDALL] Error message:', error.message);
      console.error('[TRAININGCATEGORY FINDALL] Error stack:', error.stack);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        customMessage: 'Failed to retrieve training categories',
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const trainingCategory = await this.trainingCategoryModel.findByPk(id);
      if (!trainingCategory) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Training category not found',
        });
      }
      return Responder({
        status: HttpStatusCode.Ok,
        data: trainingCategory,
        customMessage: 'Training category retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error.message,
        customMessage: 'Failed to retrieve training category',
      });
    }
  }

  async update(
    updateTrainingCategoryDto: UpdateTrainingCategoryDto,
  ): Promise<ResponseServer> {
    try {
      const { id, ...updateData } = updateTrainingCategoryDto;
      const [affectedCount] = await this.trainingCategoryModel.update(
        updateData,
        {
          where: { id },
        },
      );

      if (affectedCount === 0) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Training category not found',
        });
      }

      const updatedTrainingCategory =
        await this.trainingCategoryModel.findByPk(id);
      return Responder({
        status: HttpStatusCode.Ok,
        data: updatedTrainingCategory,
        customMessage: 'Training category updated successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error.message,
        customMessage: 'Failed to update training category',
      });
    }
  }

  async remove(
    deleteTrainingCategoryDto: DeleteTrainingCategoryDto,
  ): Promise<ResponseServer> {
    try {
      const { id } = deleteTrainingCategoryDto;

      // Check if training category exists
      const trainingCategory = await this.trainingCategoryModel.findByPk(id);
      if (!trainingCategory) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Training category not found',
        });
      }

      // Note: Relationship check removed since Formations model doesn't have id_trainingcategory field yet
      // TODO: Add id_trainingcategory field to Formations model if relationship is needed

      // Proceed with deletion
      const deletedCount = await this.trainingCategoryModel.destroy({
        where: { id },
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: { deletedCount },
        customMessage: 'Training category deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error.message,
        customMessage: 'Failed to delete training category',
      });
    }
  }
}
