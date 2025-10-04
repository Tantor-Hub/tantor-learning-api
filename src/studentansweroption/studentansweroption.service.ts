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

@Injectable()
export class StudentAnswerOptionService {
  constructor(
    @InjectModel(StudentAnswerOption)
    private studentAnswerOptionModel: typeof StudentAnswerOption,
  ) {}

  async create(
    createStudentAnswerOptionDto: CreateStudentAnswerOptionDto,
  ): Promise<ResponseServer> {
    try {
      const answerOption = await this.studentAnswerOptionModel.create(
        createStudentAnswerOptionDto as any,
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: answerOption,
        customMessage: 'Student answer option created successfully',
      });
    } catch (error) {
      console.error('Error creating student answer option:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
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
      const answerOption = await this.studentAnswerOptionModel.findByPk(id);

      if (!answerOption) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student answer option not found',
        });
      }

      await answerOption.update(updateStudentAnswerOptionDto);

      return Responder({
        status: HttpStatusCode.Ok,
        data: answerOption,
        customMessage: 'Student answer option updated successfully',
      });
    } catch (error) {
      console.error('Error updating student answer option:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error updating student answer option',
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
