import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';
import { CreateEvaluationQuestionDto } from './dto/create-evaluationquestion.dto';
import { UpdateEvaluationQuestionDto } from './dto/update-evaluationquestion.dto';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Studentevaluation } from 'src/models/model.studentevaluation';
import { EvaluationQuestionOption } from 'src/models/model.evaluationquestionoption';
import { StudentAnswer } from 'src/models/model.studentanswer';

@Injectable()
export class EvaluationQuestionService {
  constructor(
    @InjectModel(EvaluationQuestion)
    private evaluationQuestionModel: typeof EvaluationQuestion,
  ) {}

  async create(
    createEvaluationQuestionDto: CreateEvaluationQuestionDto,
  ): Promise<ResponseServer> {
    try {
      const question = await this.evaluationQuestionModel.create(
        createEvaluationQuestionDto as any,
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: question,
        customMessage: 'Evaluation question created successfully',
      });
    } catch (error) {
      console.error('Error creating evaluation question:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error creating evaluation question',
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const questions = await this.evaluationQuestionModel.findAll({
        include: [
          {
            model: Studentevaluation,
            as: 'evaluation',
            attributes: ['id', 'title'],
          },
          {
            model: EvaluationQuestionOption,
            as: 'options',
            attributes: ['id', 'text', 'isCorrect'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: questions,
        customMessage: 'Evaluation questions retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving evaluation questions:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving evaluation questions',
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const question = await this.evaluationQuestionModel.findByPk(id, {
        include: [
          {
            model: Studentevaluation,
            as: 'evaluation',
            attributes: ['id', 'title'],
          },
          {
            model: EvaluationQuestionOption,
            as: 'options',
            attributes: ['id', 'text', 'isCorrect'],
          },
        ],
      });

      if (!question) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Evaluation question not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: question,
        customMessage: 'Evaluation question retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving evaluation question:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving evaluation question',
      });
    }
  }

  async findByEvaluation(evaluationId: string): Promise<ResponseServer> {
    try {
      const questions = await this.evaluationQuestionModel.findAll({
        where: { evaluationId },
        include: [
          {
            model: Studentevaluation,
            as: 'evaluation',
            attributes: ['id', 'title'],
          },
          {
            model: EvaluationQuestionOption,
            as: 'options',
            attributes: ['id', 'text', 'isCorrect'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: questions,
        customMessage: 'Evaluation questions retrieved successfully',
      });
    } catch (error) {
      console.error(
        'Error retrieving evaluation questions by evaluation:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving evaluation questions',
      });
    }
  }

  async update(
    id: string,
    updateEvaluationQuestionDto: UpdateEvaluationQuestionDto,
  ): Promise<ResponseServer> {
    try {
      const question = await this.evaluationQuestionModel.findByPk(id);

      if (!question) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Evaluation question not found',
        });
      }

      await question.update(updateEvaluationQuestionDto);

      return Responder({
        status: HttpStatusCode.Ok,
        data: question,
        customMessage: 'Evaluation question updated successfully',
      });
    } catch (error) {
      console.error('Error updating evaluation question:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error updating evaluation question',
      });
    }
  }

  async remove(id: string): Promise<ResponseServer> {
    try {
      const question = await this.evaluationQuestionModel.findByPk(id, {
        include: [
          {
            model: EvaluationQuestionOption,
            as: 'options',
          },
        ],
      });

      if (!question) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Evaluation question not found',
        });
      }

      console.log('🗑️ Starting cascade deletion for question:', question.id);
      console.log('📝 Found options to delete:', question.options?.length || 0);

      // Start transaction for cascade deletion
      const transaction =
        await this.evaluationQuestionModel.sequelize!.transaction();

      try {
        // Delete all evaluation question options first
        if (question.options && question.options.length > 0) {
          await EvaluationQuestionOption.destroy({
            where: { questionId: id },
            transaction,
          });
          console.log(
            `✅ Deleted ${question.options.length} options for question ${id}`,
          );
        }

        // Finally delete the evaluation question
        await question.destroy({ transaction });

        // Commit the transaction
        await transaction.commit();

        console.log(
          '✅ Cascade deletion completed successfully for question:',
          id,
        );

        return Responder({
          status: HttpStatusCode.Ok,
          customMessage: `Evaluation question and all associated options deleted successfully. Deleted ${question.options?.length || 0} options.`,
          data: {
            deletedQuestion: {
              id: question.id,
              text: question.text,
              type: question.type,
            },
            deletedOptions: question.options?.length || 0,
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
        '❌ Error during cascade deletion of evaluation question:',
        error,
      );

      let errorMessage = 'Error deleting evaluation question';
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        errorMessage =
          'Cannot delete question due to existing references. Please remove all related data first.';
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
