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
      const question = await this.evaluationQuestionModel.findByPk(id);

      if (!question) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Evaluation question not found',
        });
      }

      await question.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        customMessage: 'Evaluation question deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting evaluation question:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error deleting evaluation question',
      });
    }
  }
}
