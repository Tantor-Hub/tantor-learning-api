import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentAnswerOption } from 'src/models/model.studentansweroption';
import { CreateStudentAnswerOptionDto } from './dto/create-studentansweroption.dto';
import { UpdateStudentAnswerOptionDto } from './dto/update-studentansweroption.dto';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { StudentAnswer } from 'src/models/model.studentanswer';
import { EvaluationQuestionOption } from 'src/models/model.evaluationquestionoption';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';

@Injectable()
export class StudentAnswerOptionService {
  constructor(
    @InjectModel(StudentAnswerOption)
    private studentAnswerOptionModel: typeof StudentAnswerOption,
    @InjectModel(EvaluationQuestionOption)
    private evaluationQuestionOptionModel: typeof EvaluationQuestionOption,
    @InjectModel(EvaluationQuestion)
    private evaluationQuestionModel: typeof EvaluationQuestion,
  ) {}

  async create(
    createStudentAnswerOptionDto: CreateStudentAnswerOptionDto,
  ): Promise<ResponseServer> {
    try {
      console.log('=== StudentAnswerOption create: Starting ===');
      console.log(
        'CreateStudentAnswerOptionDto:',
        createStudentAnswerOptionDto,
      );

      // Get the evaluation question option to check if it's correct
      const questionOption = await this.evaluationQuestionOptionModel.findByPk(
        createStudentAnswerOptionDto.optionId,
      );

      if (!questionOption) {
        console.log(
          '=== StudentAnswerOption create: Question option not found ===',
        );
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Option de question non trouvée',
        });
      }

      // Check if the selected option is correct
      const isCorrect = questionOption.isCorrect || false;

      // Validate points if provided
      if (
        createStudentAnswerOptionDto.points !== undefined &&
        createStudentAnswerOptionDto.points !== null
      ) {
        // Get the question to validate points
        const question = await this.evaluationQuestionModel.findByPk(
          questionOption.questionId,
        );
        if (question && createStudentAnswerOptionDto.points > question.points) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: `Les points attribués (${createStudentAnswerOptionDto.points}) ne peuvent pas dépasser le maximum de points de la question (${question.points})`,
          });
        }
      }

      console.log('=== StudentAnswerOption create: Answer validation ===');
      console.log('Selected option ID:', createStudentAnswerOptionDto.optionId);
      console.log('Option is correct:', isCorrect);

      // Create the student answer option with the isCorrect field set
      const answerOption = await this.studentAnswerOptionModel.create({
        studentAnswerId: createStudentAnswerOptionDto.studentAnswerId,
        optionId: createStudentAnswerOptionDto.optionId,
        isCorrect: isCorrect,
        points: createStudentAnswerOptionDto.points || (isCorrect ? 1 : 0),
      } as any);

      console.log('=== StudentAnswerOption create: Success ===');
      console.log('Answer option created:', answerOption.id);
      console.log('Is correct:', answerOption.isCorrect);

      return Responder({
        status: HttpStatusCode.Created,
        data: answerOption,
        customMessage: 'Option de réponse étudiante créée avec succès',
      });
    } catch (error) {
      console.error('=== StudentAnswerOption create: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Error creating student answer option',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
        customMessage: 'Error creating student answer option',
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const answerOptions = await this.studentAnswerOptionModel.findAll({
        include: [
          {
            model: StudentAnswer,
            as: 'studentAnswer',
            attributes: ['id', 'answerText', 'isCorrect'],
          },
          {
            model: EvaluationQuestionOption,
            as: 'option',
            attributes: ['id', 'text', 'isCorrect'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: answerOptions,
        customMessage: 'Student answer options retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student answer options:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student answer options',
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const answerOption = await this.studentAnswerOptionModel.findByPk(id, {
        include: [
          {
            model: StudentAnswer,
            as: 'studentAnswer',
            attributes: ['id', 'answerText', 'isCorrect'],
          },
          {
            model: EvaluationQuestionOption,
            as: 'option',
            attributes: ['id', 'text', 'isCorrect'],
          },
        ],
      });

      if (!answerOption) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student answer option not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: answerOption,
        customMessage: 'Student answer option retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student answer option:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student answer option',
      });
    }
  }

  async findByStudentAnswer(studentAnswerId: string): Promise<ResponseServer> {
    try {
      const answerOptions = await this.studentAnswerOptionModel.findAll({
        where: { studentAnswerId },
        include: [
          {
            model: StudentAnswer,
            as: 'studentAnswer',
            attributes: ['id', 'answerText', 'isCorrect'],
          },
          {
            model: EvaluationQuestionOption,
            as: 'option',
            attributes: ['id', 'text', 'isCorrect'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: answerOptions,
        customMessage: 'Student answer options retrieved successfully',
      });
    } catch (error) {
      console.error(
        'Error retrieving student answer options by student answer:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student answer options',
      });
    }
  }

  async update(
    id: string,
    updateStudentAnswerOptionDto: UpdateStudentAnswerOptionDto,
  ): Promise<ResponseServer> {
    try {
      const answerOption = await this.studentAnswerOptionModel.findByPk(id, {
        include: [
          {
            model:
              this.studentAnswerOptionModel.sequelize!.models.StudentAnswer,
            as: 'studentAnswer',
            include: [
              {
                model:
                  this.studentAnswerOptionModel.sequelize!.models
                    .EvaluationQuestion,
                as: 'question',
              },
            ],
          },
        ],
      });

      if (!answerOption) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Option de réponse étudiante non trouvée',
        });
      }

      // Validate points if provided
      if (
        updateStudentAnswerOptionDto.points !== undefined &&
        updateStudentAnswerOptionDto.points !== null
      ) {
        const studentAnswer = answerOption.studentAnswer as any;
        const question = studentAnswer?.question as EvaluationQuestion;

        if (question && updateStudentAnswerOptionDto.points > question.points) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: `Les points attribués (${updateStudentAnswerOptionDto.points}) ne peuvent pas dépasser le maximum de points de la question (${question.points})`,
          });
        }
      }

      await answerOption.update(updateStudentAnswerOptionDto);

      return Responder({
        status: HttpStatusCode.Ok,
        data: answerOption,
        customMessage: 'Option de réponse étudiante mise à jour avec succès',
      });
    } catch (error) {
      console.error('Error updating student answer option:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage:
          "Erreur lors de la mise à jour de l'option de réponse étudiante",
      });
    }
  }

  async remove(id: string): Promise<ResponseServer> {
    try {
      const answerOption = await this.studentAnswerOptionModel.findByPk(id);

      if (!answerOption) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student answer option not found',
        });
      }

      await answerOption.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        customMessage: 'Student answer option deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting student answer option:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error deleting student answer option',
      });
    }
  }
}
