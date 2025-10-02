import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentSession } from '../models/model.studentsession';
import { CreateStudentSessionDto } from './dto/create-studentsession.dto';
import { UpdateStudentSessionDto } from './dto/update-studentsession.dto';
import { Responder } from '../strategy/strategy.responder';
import { HttpStatusCode } from '../config/config.statuscodes';
import { TrainingSession } from '../models/model.trainingssession';
import { Users } from '../models/model.users';

@Injectable()
export class StudentSessionService {
  constructor(
    @InjectModel(StudentSession)
    private readonly studentSessionModel: typeof StudentSession,
    @InjectModel(TrainingSession)
    private readonly trainingSessionModel: typeof TrainingSession,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
  ) {}

  async create(createStudentSessionDto: CreateStudentSessionDto) {
    try {
      // Verify that the training session exists
      const trainingSession = await this.trainingSessionModel.findByPk(
        createStudentSessionDto.id_session,
      );
      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Training session not found',
        });
      }

      // Verify that the student (user) exists
      const student = await this.usersModel.findOne({
        where: { id: createStudentSessionDto.id_student },
      });
      if (!student) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Student not found',
        });
      }

      // Check if the student is already enrolled in this session
      const existingEnrollment = await this.studentSessionModel.findOne({
        where: {
          id_session: createStudentSessionDto.id_session,
          id_student: createStudentSessionDto.id_student,
        },
      });
      if (existingEnrollment) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: 'Student is already enrolled in this training session',
        });
      }

      const studentSession = await this.studentSessionModel.create({
        id_session: createStudentSessionDto.id_session,
        id_student: createStudentSessionDto.id_student,
      });

      // Fetch the created student session with its relationships
      const createdStudentSession = await this.studentSessionModel.findByPk(
        studentSession.id,
        {
          include: [
            {
              model: TrainingSession,
              as: 'trainingSession',
              attributes: [
                'id',
                'title',
                'nb_places',
                'available_places',
                'begining_date',
                'ending_date',
              ],
            },
            {
              model: Users,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: createdStudentSession,
        customMessage: 'Student enrolled in training session successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error enrolling student in training session',
      });
    }
  }

  async findAll() {
    try {
      const studentSessions = await this.studentSessionModel.findAll({
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: studentSessions,
        customMessage: 'Student sessions retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error fetching student sessions',
      });
    }
  }

  async findOne(id: string) {
    try {
      const studentSession = await this.studentSessionModel.findByPk(id, {
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
          },
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      if (!studentSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Student session not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: studentSession,
        customMessage: 'Student session retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error fetching student session',
      });
    }
  }

  async update(id: string, updateStudentSessionDto: UpdateStudentSessionDto) {
    try {
      const studentSession = await this.studentSessionModel.findByPk(id);
      if (!studentSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Student session not found',
        });
      }

      // If updating training session reference, verify it exists
      if (updateStudentSessionDto.id_session) {
        const trainingSession = await this.trainingSessionModel.findByPk(
          updateStudentSessionDto.id_session,
        );
        if (!trainingSession) {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: 'Training session not found',
          });
        }
      }

      // If updating student reference, verify it exists
      if (updateStudentSessionDto.id_student) {
        const student = await this.usersModel.findOne({
          where: { id: updateStudentSessionDto.id_student },
        });
        if (!student) {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: 'Student not found',
          });
        }
      }

      await studentSession.update(updateStudentSessionDto);

      // Fetch the updated student session with its relationships
      const updatedStudentSession = await this.studentSessionModel.findByPk(
        id,
        {
          include: [
            {
              model: TrainingSession,
              as: 'trainingSession',
              attributes: [
                'id',
                'title',
                'nb_places',
                'available_places',
                'begining_date',
                'ending_date',
              ],
            },
            {
              model: Users,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: updatedStudentSession,
        customMessage: 'Student session updated successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error updating student session',
      });
    }
  }

  async remove(id: string) {
    try {
      const studentSession = await this.studentSessionModel.findByPk(id);
      if (!studentSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Student session not found',
        });
      }

      await studentSession.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id },
        customMessage: 'Student session deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error deleting student session',
      });
    }
  }

  async findByTrainingSessionId(trainingSessionId: string) {
    try {
      const studentSessions = await this.studentSessionModel.findAll({
        where: {
          id_session: trainingSessionId,
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title', 'nb_places', 'available_places'],
          },
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: studentSessions,
        customMessage: 'Student sessions retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error fetching student sessions by training session ID',
      });
    }
  }

  async findByStudentId(studentId: string) {
    try {
      const studentSessions = await this.studentSessionModel.findAll({
        where: {
          id_student: studentId,
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
          },
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: studentSessions,
        customMessage: 'Student sessions retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error fetching student sessions by student ID',
      });
    }
  }
}
