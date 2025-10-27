import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { TrainingCategory } from 'src/models/model.trainingcategory';
import { Training } from 'src/models/model.trainings';
import { Responder } from 'src/strategy/strategy.responder';
import { CreateTrainingCategoryDto } from './dto/create-trainingcategory.dto';
import { UpdateTrainingCategoryDto } from './dto/update-trainingcategory.dto';
import { DeleteTrainingCategoryDto } from './dto/delete-trainingcategory.dto';

@Injectable()
export class TrainingCategoryService {
  constructor(
    @InjectModel(TrainingCategory)
    private readonly trainingCategoryModel: typeof TrainingCategory,
    @InjectModel(Training)
    private readonly trainingModel: typeof Training,
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

      // Check if there are any trainings associated with this category
      const associatedTrainings = await this.trainingModel.findAll({
        where: { id_trainingcategory: id },
        attributes: ['id', 'title'],
      });

      if (associatedTrainings.length > 0) {
        const trainingTitles = associatedTrainings
          .map((training) => training.title)
          .join(', ');

        const customMessage = `Impossible de supprimer cette catégorie de formation car ${associatedTrainings.length} formation(s) y sont associée(s): ${trainingTitles}. Veuillez d'abord supprimer ou réassigner les formations avant de supprimer la catégorie.`;

        console.log(
          '[TRAININGCATEGORY SERVICE] 📝 Custom Message:',
          customMessage,
        );

        const response = Responder({
          status: HttpStatusCode.Conflict,
          customMessage: customMessage,
        });

        console.log(
          '[TRAININGCATEGORY DELETE] ❌ Cannot delete - associated trainings found:',
          {
            categoryId: id,
            categoryTitle: trainingCategory.title,
            associatedTrainingsCount: associatedTrainings.length,
            associatedTrainings: associatedTrainings.map((t) => ({
              id: t.id,
              title: t.title,
            })),
            responseStatus: response.status,
            responseMessage: response.message,
          },
        );

        return response;
      }

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
