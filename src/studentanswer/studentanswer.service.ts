import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentAnswer } from 'src/models/model.studentanswer';
import { CreateStudentAnswerDto } from './dto/create-studentanswer.dto';
import { UpdateStudentAnswerDto } from './dto/update-studentanswer.dto';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';
import { Studentevaluation } from 'src/models/model.studentevaluation';
import { Users } from 'src/models/model.users';
import { StudentAnswerOption } from 'src/models/model.studentansweroption';

@Injectable()
export class StudentAnswerService {
  constructor(
    @InjectModel(StudentAnswer)
    private studentAnswerModel: typeof StudentAnswer,
  ) {}

  async create(
    createStudentAnswerDto: CreateStudentAnswerDto,
  ): Promise<ResponseServer> {
    try {
      console.log('=== StudentAnswer create: Starting ===');
      console.log('CreateStudentAnswerDto:', createStudentAnswerDto);

      // Validate that the referenced entities exist
      const question =
        await this.studentAnswerModel.sequelize!.models.EvaluationQuestion.findByPk(
          createStudentAnswerDto.questionId,
        );
      if (!question) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Invalid questionId: Question does not exist',
        });
      }

      const student =
        await this.studentAnswerModel.sequelize!.models.Users.findByPk(
          createStudentAnswerDto.studentId,
        );
      if (!student) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Invalid studentId: Student does not exist',
        });
      }

      const evaluation =
        await this.studentAnswerModel.sequelize!.models.Studentevaluation.findByPk(
          createStudentAnswerDto.evaluationId,
        );
      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Invalid evaluationId: Evaluation does not exist',
        });
      }

      // Check if student has already submitted an answer for this specific question in this evaluation
      const existingAnswer = await this.studentAnswerModel.findOne({
        where: {
          studentId: createStudentAnswerDto.studentId,
          evaluationId: createStudentAnswerDto.evaluationId,
          questionId: createStudentAnswerDto.questionId,
        },
      });

      if (existingAnswer) {
        return Responder({
          status: HttpStatusCode.Conflict,
          customMessage:
            'Vous avez déjà soumis une réponse pour cette question dans cette évaluation',
        });
      }

      // Validate points if provided
      if (
        createStudentAnswerDto.points !== undefined &&
        createStudentAnswerDto.points !== null
      ) {
        const questionData = question as EvaluationQuestion;
        if (createStudentAnswerDto.points > questionData.points) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: `Les points attribués (${createStudentAnswerDto.points}) ne peuvent pas dépasser le maximum de points de la question (${questionData.points})`,
          });
        }
      }

      const answer = await this.studentAnswerModel.create({
        questionId: createStudentAnswerDto.questionId,
        studentId: createStudentAnswerDto.studentId,
        evaluationId: createStudentAnswerDto.evaluationId,
        answerText: createStudentAnswerDto.answerText,
        isCorrect: createStudentAnswerDto.isCorrect,
        points: createStudentAnswerDto.points,
      } as any);

      console.log('=== StudentAnswer create: Success ===');
      console.log('Answer created:', answer.id);

      return Responder({
        status: HttpStatusCode.Created,
        data: answer,
        customMessage: 'Student answer created successfully',
      });
    } catch (error) {
      console.error('=== StudentAnswer create: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Error creating student answer',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
        customMessage: 'Error creating student answer',
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const answers = await this.studentAnswerModel.findAll({
        include: [
          {
            model: EvaluationQuestion,
            as: 'question',
            attributes: ['id', 'text', 'type', 'points'],
          },
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Studentevaluation,
            as: 'evaluation',
            attributes: ['id', 'title'],
          },
          {
            model: StudentAnswerOption,
            as: 'selectedOptions',
            attributes: ['id', 'optionId', 'questionId'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: answers,
        customMessage: 'Student answers retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student answers:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student answers',
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const answer = await this.studentAnswerModel.findByPk(id, {
        include: [
          {
            model: EvaluationQuestion,
            as: 'question',
            attributes: ['id', 'text', 'type', 'points'],
          },
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Studentevaluation,
            as: 'evaluation',
            attributes: ['id', 'title'],
          },
          {
            model: StudentAnswerOption,
            as: 'selectedOptions',
            attributes: ['id', 'optionId', 'questionId'],
          },
        ],
      });

      if (!answer) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student answer not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: answer,
        customMessage: 'Student answer retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student answer:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student answer',
      });
    }
  }

  async findByStudent(studentId: string): Promise<ResponseServer> {
    try {
      const answers = await this.studentAnswerModel.findAll({
        where: { studentId },
        include: [
          {
            model: EvaluationQuestion,
            as: 'question',
            attributes: ['id', 'text', 'type', 'points'],
          },
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Studentevaluation,
            as: 'evaluation',
            attributes: ['id', 'title'],
          },
          {
            model: StudentAnswerOption,
            as: 'selectedOptions',
            attributes: ['id', 'optionId', 'questionId'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: answers,
        customMessage: 'Student answers retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student answers by student:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student answers',
      });
    }
  }

  async findByEvaluation(evaluationId: string): Promise<ResponseServer> {
    try {
      const answers = await this.studentAnswerModel.findAll({
        where: { evaluationId },
        include: [
          {
            model: EvaluationQuestion,
            as: 'question',
            attributes: ['id', 'text', 'type', 'points'],
          },
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Studentevaluation,
            as: 'evaluation',
            attributes: ['id', 'title'],
          },
          {
            model: StudentAnswerOption,
            as: 'selectedOptions',
            attributes: ['id', 'optionId', 'questionId'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: answers,
        customMessage: 'Student answers retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student answers by evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student answers',
      });
    }
  }

  async findByQuestion(questionId: string): Promise<ResponseServer> {
    try {
      const answers = await this.studentAnswerModel.findAll({
        where: { questionId },
        include: [
          {
            model: this.studentAnswerModel.sequelize!.models.EvaluationQuestion,
            as: 'question',
          },
          {
            model: this.studentAnswerModel.sequelize!.models.Users,
            as: 'student',
          },
          {
            model: this.studentAnswerModel.sequelize!.models.Studentevaluation,
            as: 'evaluation',
          },
          {
            model:
              this.studentAnswerModel.sequelize!.models.StudentAnswerOption,
            as: 'selectedOptions',
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          answers,
          total: answers.length,
          questionId,
        },
        customMessage: "Réponses d'étudiants récupérées avec succès",
      });
    } catch (error) {
      console.error('Error retrieving student answers by question:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage:
          "Erreur lors de la récupération des réponses d'étudiants",
      });
    }
  }

  async update(
    id: string,
    updateStudentAnswerDto: UpdateStudentAnswerDto,
  ): Promise<ResponseServer> {
    try {
      const answer = await this.studentAnswerModel.findByPk(id, {
        include: [
          {
            model: this.studentAnswerModel.sequelize!.models.EvaluationQuestion,
            as: 'question',
          },
        ],
      });

      if (!answer) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student answer not found',
        });
      }

      // Validate points if provided
      if (
        updateStudentAnswerDto.points !== undefined &&
        updateStudentAnswerDto.points !== null
      ) {
        const question = answer.question as EvaluationQuestion;
        if (question && updateStudentAnswerDto.points > question.points) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: `Les points attribués (${updateStudentAnswerDto.points}) ne peuvent pas dépasser le maximum de points de la question (${question.points})`,
          });
        }
      }

      await answer.update(updateStudentAnswerDto);

      return Responder({
        status: HttpStatusCode.Ok,
        data: answer,
        customMessage: 'Student answer updated successfully',
      });
    } catch (error) {
      console.error('Error updating student answer:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error updating student answer',
      });
    }
  }

  async remove(id: string): Promise<ResponseServer> {
    try {
      const answer = await this.studentAnswerModel.findByPk(id);

      if (!answer) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student answer not found',
        });
      }

      await answer.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        customMessage: 'Student answer deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting student answer:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error deleting student answer',
      });
    }
  }
}
