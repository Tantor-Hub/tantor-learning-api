import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
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
    @InjectModel(Studentevaluation)
    private studentevaluationModel: typeof Studentevaluation,
  ) {}

  async create(
    createEvaluationQuestionDto: CreateEvaluationQuestionDto,
  ): Promise<ResponseServer> {
    try {
      // First, get the student evaluation to check total points
      const evaluation = await this.studentevaluationModel.findByPk(
        createEvaluationQuestionDto.evaluationId,
      );

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Évaluation étudiante non trouvée',
        });
      }

      // Get all existing questions for this evaluation
      const existingQuestions = await this.evaluationQuestionModel.findAll({
        where: { evaluationId: createEvaluationQuestionDto.evaluationId },
        attributes: ['points'],
      });

      // Calculate total points from existing questions
      const existingPointsSum = existingQuestions.reduce(
        (sum, question) => sum + (question.points || 0),
        0,
      );

      // Add the new question's points
      const newQuestionPoints = createEvaluationQuestionDto.points || 1;
      const totalPointsAfterAddition = existingPointsSum + newQuestionPoints;

      // Check if total points exceed the evaluation's points
      // Allow first question to have more points than evaluation
      if (
        existingQuestions.length > 0 &&
        totalPointsAfterAddition > evaluation.points
      ) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: `Le total des points des questions (${totalPointsAfterAddition}) dépasse les points de l'évaluation (${evaluation.points}). Veuillez réduire les points de cette question.`,
        });
      }

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

      // If points are being updated, check the total points constraint
      if (updateEvaluationQuestionDto.points !== undefined) {
        // Get the student evaluation to check total points
        const evaluation = await this.studentevaluationModel.findByPk(
          question.evaluationId,
        );

        if (!evaluation) {
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'Évaluation étudiante non trouvée',
          });
        }

        // Get all existing questions for this evaluation except the current one
        const existingQuestions = await this.evaluationQuestionModel.findAll({
          where: {
            evaluationId: question.evaluationId,
            id: { [Op.ne]: id },
          },
          attributes: ['points'],
        });

        // Calculate total points from other questions
        const otherQuestionsPointsSum = existingQuestions.reduce(
          (sum, q) => sum + (q.points || 0),
          0,
        );

        // Add the updated question's points
        const updatedPoints = updateEvaluationQuestionDto.points;
        const totalPointsAfterUpdate = otherQuestionsPointsSum + updatedPoints;

        // Check if total points exceed the evaluation's points
        // Allow first question to have more points than evaluation
        if (
          existingQuestions.length > 0 &&
          totalPointsAfterUpdate > evaluation.points
        ) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: `Le total des points des questions (${totalPointsAfterUpdate}) dépasse les points de l'évaluation (${evaluation.points}). Veuillez réduire les points de cette question.`,
          });
        }
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

  async findByEvaluationForStudent(
    evaluationId: string,
    studentId: string,
  ): Promise<ResponseServer> {
    try {
      console.log(
        `[EVALUATION QUESTION SERVICE] Getting evaluation questions for student ${studentId} and evaluation ${evaluationId}`,
      );

      // First, verify the evaluation exists and student is enrolled
      const evaluation =
        await this.studentevaluationModel.findByPk(evaluationId);

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      // Check if the evaluation is published
      if (!evaluation.ispublish) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'This evaluation is not yet published',
        });
      }

      // Check if the student is enrolled in this evaluation, if not, add them
      let studentIds = evaluation.studentId || [];
      if (!Array.isArray(studentIds)) {
        studentIds = [];
      }

      if (!studentIds.includes(studentId)) {
        // Add the student to the evaluation
        studentIds.push(studentId);
        await this.studentevaluationModel.update(
          { studentId: studentIds },
          { where: { id: evaluationId } },
        );
        console.log(
          `[EVALUATION QUESTION SERVICE] Added student ${studentId} to evaluation ${evaluationId}`,
        );
      }

      // Check if the evaluation is still available (not past submission date)
      const now = new Date();
      const submissionDate = new Date(evaluation.submittiondate);

      if (now > submissionDate) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'This evaluation has expired',
        });
      }

      // Get the questions from the EvaluationQuestion table
      const questions = await this.evaluationQuestionModel.findAll({
        where: { evaluationId },
        include: [
          {
            model: EvaluationQuestionOption,
            as: 'options',
            attributes: ['id', 'text'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      console.log(
        `[EVALUATION QUESTION SERVICE] ✅ Successfully retrieved ${questions.length} questions for student ${studentId}`,
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: questions,
        customMessage: 'Evaluation questions retrieved successfully',
      });
    } catch (error) {
      console.error(
        '[EVALUATION QUESTION SERVICE] Error getting evaluation questions for student:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          "Erreur lors de la récupération des questions d'évaluation",
      });
    }
  }
}
