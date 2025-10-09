import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EvaluationQuestionOption } from 'src/models/model.evaluationquestionoption';
import { CreateEvaluationQuestionOptionDto } from './dto/create-evaluationquestionoption.dto';
import { UpdateEvaluationQuestionOptionDto } from './dto/update-evaluationquestionoption.dto';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';
import { StudentAnswerOption } from 'src/models/model.studentansweroption';

@Injectable()
export class EvaluationQuestionOptionService {
  constructor(
    @InjectModel(EvaluationQuestionOption)
    private evaluationQuestionOptionModel: typeof EvaluationQuestionOption,
  ) {}

  async create(
    createEvaluationQuestionOptionDto: CreateEvaluationQuestionOptionDto,
  ): Promise<ResponseServer> {
    try {
      const option = await this.evaluationQuestionOptionModel.create(
        createEvaluationQuestionOptionDto as any,
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: option,
        customMessage: 'Evaluation question option created successfully',
      });
    } catch (error) {
      console.error('Error creating evaluation question option:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error creating evaluation question option',
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const options = await this.evaluationQuestionOptionModel.findAll({
        include: [
          {
            model: EvaluationQuestion,
            as: 'question',
            attributes: ['id', 'text', 'type'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: options,
        customMessage: 'Evaluation question options retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving evaluation question options:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving evaluation question options',
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const option = await this.evaluationQuestionOptionModel.findByPk(id, {
        include: [
          {
            model: EvaluationQuestion,
            as: 'question',
            attributes: ['id', 'text', 'type'],
          },
        ],
      });

      if (!option) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Evaluation question option not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: option,
        customMessage: 'Evaluation question option retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving evaluation question option:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving evaluation question option',
      });
    }
  }

  async findByQuestion(questionId: string): Promise<ResponseServer> {
    try {
      const options = await this.evaluationQuestionOptionModel.findAll({
        where: { questionId },
        include: [
          {
            model: EvaluationQuestion,
            as: 'question',
            attributes: ['id', 'text', 'type'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: options,
        customMessage: 'Evaluation question options retrieved successfully',
      });
    } catch (error) {
      console.error(
        'Error retrieving evaluation question options by question:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving evaluation question options',
      });
    }
  }

  async update(
    id: string,
    updateEvaluationQuestionOptionDto: UpdateEvaluationQuestionOptionDto,
  ): Promise<ResponseServer> {
    try {
      const option = await this.evaluationQuestionOptionModel.findByPk(id);

      if (!option) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Evaluation question option not found',
        });
      }

      await option.update(updateEvaluationQuestionOptionDto);

      return Responder({
        status: HttpStatusCode.Ok,
        data: option,
        customMessage: 'Evaluation question option updated successfully',
      });
    } catch (error) {
      console.error('Error updating evaluation question option:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error updating evaluation question option',
      });
    }
  }

  async remove(id: string): Promise<ResponseServer> {
    try {
      const option = await this.evaluationQuestionOptionModel.findByPk(id, {
        include: [
          {
            model: StudentAnswerOption,
            as: 'studentAnswerOptions',
          },
        ],
      });

      if (!option) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Evaluation question option not found',
        });
      }

      console.log('🗑️ Checking if option can be deleted:', option.id);
      console.log(
        '📝 Found student answer options:',
        option.studentAnswerOptions?.length || 0,
      );

      // Check if there are any student answer options
      if (
        option.studentAnswerOptions &&
        option.studentAnswerOptions.length > 0
      ) {
        console.log(
          '❌ Cannot delete option - has student answer options:',
          option.studentAnswerOptions.length,
        );
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: `Cannot delete evaluation question option. This option has been used by ${option.studentAnswerOptions.length} student answer(s). To maintain data integrity, options with student answers cannot be deleted.`,
          data: {
            optionId: option.id,
            optionText: option.text,
            studentAnswerCount: option.studentAnswerOptions.length,
            reason: 'Option has associated student answers',
          },
        });
      }

      console.log(
        '✅ No student answer options found - proceeding with deletion',
      );

      // Start transaction for deletion
      const transaction =
        await this.evaluationQuestionOptionModel.sequelize!.transaction();

      try {
        // Delete the evaluation question option
        await option.destroy({ transaction });

        // Commit the transaction
        await transaction.commit();

        console.log('✅ Option deletion completed successfully:', id);

        return Responder({
          status: HttpStatusCode.Ok,
          customMessage: 'Evaluation question option deleted successfully.',
          data: {
            deletedOption: {
              id: option.id,
              text: option.text,
              isCorrect: option.isCorrect,
            },
          },
        });
      } catch (transactionError) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error(
          '❌ Transaction rolled back due to error:',
          transactionError,
        );
        throw transactionError;
      }
    } catch (error) {
      console.error(
        '❌ Error during cascade deletion of evaluation question option:',
        error,
      );

      let errorMessage = 'Error deleting evaluation question option';
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        errorMessage =
          'Cannot delete option due to existing references. Please remove all related data first.';
      } else if (error.name === 'SequelizeDatabaseError') {
        errorMessage = 'Database error occurred during deletion.';
      }

      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: errorMessage,
        data: {
          error: error.message,
          errorType: error.name,
        },
      });
    }
  }
}
