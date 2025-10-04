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
      const answer = await this.studentAnswerModel.create(
        createStudentAnswerDto as any,
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: answer,
        customMessage: 'Student answer created successfully',
      });
    } catch (error) {
      console.error('Error creating student answer:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
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
            attributes: ['id', 'optionId'],
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
            attributes: ['id', 'optionId'],
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
            attributes: ['id', 'optionId'],
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
            attributes: ['id', 'optionId'],
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

  async update(
    id: string,
    updateStudentAnswerDto: UpdateStudentAnswerDto,
  ): Promise<ResponseServer> {
    try {
      const answer = await this.studentAnswerModel.findByPk(id);

      if (!answer) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student answer not found',
        });
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
