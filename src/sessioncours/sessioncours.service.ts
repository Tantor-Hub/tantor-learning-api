import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, literal } from 'sequelize';
import { SessionCours } from 'src/models/model.sessioncours';
import { Users } from 'src/models/model.users';
import { TrainingSession } from 'src/models/model.trainingssession';
import { Lesson } from 'src/models/model.lesson';
import { CreateSessionCoursDto } from './dto/create-sessioncours.dto';
import { UpdateSessionCoursDto } from './dto/update-sessioncours.dto';
import { ISessionCours } from 'src/interface/interface.sessioncours';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';

@Injectable()
export class SessionCoursService {
  constructor(
    @InjectModel(SessionCours)
    private readonly sessionCoursModel: typeof SessionCours,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
    @InjectModel(TrainingSession)
    private readonly trainingSessionModel: typeof TrainingSession,
    @InjectModel(Lesson)
    private readonly lessonModel: typeof Lesson,
  ) {}

  async create(
    user: IJwtSignin,
    createSessionCoursDto: CreateSessionCoursDto,
  ): Promise<ResponseServer> {
    try {
      console.log('=== SessionCours create: Starting ===');
      console.log('Create DTO:', createSessionCoursDto);
      console.log('User:', user);

      const sessionCoursData: Omit<ISessionCours, 'id'> = {
        ...createSessionCoursDto,
        createdBy: user.id_user,
      };

      const createdSessionCours =
        await this.sessionCoursModel.create(sessionCoursData);

      console.log('=== SessionCours create: Success ===');
      console.log('Created session cours:', createdSessionCours.toJSON());

      return Responder({
        status: HttpStatusCode.Created,
        data: createdSessionCours,
        customMessage: 'Session course created successfully',
      });
    } catch (error) {
      console.error('=== SessionCours create: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while creating session course',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      console.log('=== SessionCours findAll: Starting ===');

      const sessionCours = await this.sessionCoursModel.findAll({
        attributes: [
          'id',
          'title',
          'description',
          'is_published',
          'id_session',
          'id_formateur',
          'ponderation',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'CreatedBy',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: TrainingSession,
            required: false,
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
        ],
        order: [['createdAt', 'DESC']],
      });

      // Transform id_formateur array to include instructor details
      const sessionCoursWithFormateurs = await Promise.all(
        sessionCours.map(async (cours) => {
          const coursData = cours.toJSON() as any;

          if (coursData.id_formateur && coursData.id_formateur.length > 0) {
            // Fetch instructor details for each formateur ID
            const formateurs = await this.usersModel.findAll({
              where: {
                id: coursData.id_formateur,
                role: 'instructor',
              },
              attributes: ['id', 'firstName', 'lastName'],
            });

            coursData.formateurs = formateurs.map((formateur) =>
              formateur.toJSON(),
            );
          } else {
            coursData.formateurs = [];
          }

          // Remove the raw id_formateur array since we now have formateurs objects
          delete coursData.id_formateur;

          return coursData;
        }),
      );

      console.log('=== SessionCours findAll: Success ===');
      console.log('Session cours found:', sessionCoursWithFormateurs.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: sessionCoursWithFormateurs.length,
          rows: sessionCoursWithFormateurs,
        },
        customMessage: 'Session courses retrieved successfully',
      });
    } catch (error) {
      console.error('=== SessionCours findAll: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while fetching session courses',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findBySessionId(sessionId: string): Promise<ResponseServer> {
    try {
      console.log('=== SessionCours findBySessionId: Starting ===');
      console.log('Session ID:', sessionId);

      // First, validate that the session exists
      const sessionExists = await this.trainingSessionModel.findByPk(sessionId);
      if (!sessionExists) {
        console.log('=== SessionCours findBySessionId: Session not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session not found',
        });
      }

      const sessionCours = await this.sessionCoursModel.findAll({
        where: { id_session: sessionId },
        attributes: [
          'id',
          'title',
          'description',
          'is_published',
          'id_formateur',
          'ponderation',
          'createdAt',
          'updatedAt',
        ],
        order: [['createdAt', 'DESC']],
      });

      // Transform id_formateur array to include instructor details
      const sessionCoursWithFormateurs = await Promise.all(
        sessionCours.map(async (cours) => {
          const coursData = cours.toJSON() as any;

          if (coursData.id_formateur && coursData.id_formateur.length > 0) {
            // Fetch instructor details for each formateur ID
            const formateurs = await this.usersModel.findAll({
              where: {
                id: coursData.id_formateur,
                role: 'instructor',
              },
              attributes: ['id', 'firstName', 'lastName'],
            });

            coursData.formateurs = formateurs.map((formateur) =>
              formateur.toJSON(),
            );
          } else {
            coursData.formateurs = [];
          }

          // Remove the raw id_formateur array since we now have formateurs objects
          delete coursData.id_formateur;

          return coursData;
        }),
      );

      console.log('=== SessionCours findBySessionId: Success ===');
      console.log('Session cours found:', sessionCoursWithFormateurs.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: sessionCoursWithFormateurs.length,
          rows: sessionCoursWithFormateurs,
        },
      });
    } catch (error) {
      console.error('=== SessionCours findBySessionId: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving session courses',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findByFormateurId(user: IJwtSignin): Promise<ResponseServer> {
    try {
      console.log('=== SessionCours findByFormateurId: Starting ===');
      console.log('User:', user);
      console.log('Formateur ID from token:', user.id_user);

      // Filter session courses where the current user is assigned as instructor
      const sessionCours = await this.sessionCoursModel.findAll({
        where: {
          id_formateur: {
            [Op.contains]: [user.id_user],
          },
        },
        attributes: [
          'id',
          'title',
          'description',
          'is_published',
          'id_session',
          'id_formateur',
          'ponderation',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'CreatedBy',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: TrainingSession,
            required: false,
            as: 'trainingSession',
            attributes: ['id', 'title', 'begining_date', 'ending_date'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Transform id_formateur array to include instructor details
      const sessionCoursWithFormateurs = await Promise.all(
        sessionCours.map(async (cours) => {
          const coursData = cours.toJSON() as any;

          if (coursData.id_formateur && coursData.id_formateur.length > 0) {
            // Fetch instructor details for each formateur ID
            const formateurs = await this.usersModel.findAll({
              where: {
                id: coursData.id_formateur,
                role: 'instructor',
              },
              attributes: ['id', 'firstName', 'lastName'],
            });

            coursData.formateurs = formateurs.map((formateur) =>
              formateur.toJSON(),
            );
          } else {
            coursData.formateurs = [];
          }

          // Remove the raw id_formateur array since we now have formateurs objects
          delete coursData.id_formateur;

          return coursData;
        }),
      );

      console.log('=== SessionCours findByFormateurId: Success ===');
      console.log('Session cours found:', sessionCoursWithFormateurs);
      console.log('Session cours found:', sessionCoursWithFormateurs.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: sessionCoursWithFormateurs.length,
          rows: sessionCoursWithFormateurs,
        },
        customMessage: 'Session courses retrieved successfully',
      });
    } catch (error) {
      console.error('=== SessionCours findByFormateurId: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message:
            'Internal server error while retrieving session courses by formateur',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      console.log('=== SessionCours findOne: Starting ===');
      console.log('Session cours ID:', id);

      const sessionCours = await this.sessionCoursModel.findByPk(id, {
        attributes: [
          'id',
          'title',
          'description',
          'is_published',
          'id_session',
          'id_formateur',
          'ponderation',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'CreatedBy',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: TrainingSession,
            required: false,
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
        ],
      });

      if (!sessionCours) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Session course not found',
        });
      }

      // Transform id_formateur array to include instructor details
      const coursData = sessionCours.toJSON() as any;

      if (coursData.id_formateur && coursData.id_formateur.length > 0) {
        // Fetch instructor details for each formateur ID
        const formateurs = await this.usersModel.findAll({
          where: {
            id: coursData.id_formateur,
            role: 'instructor',
          },
          attributes: ['id', 'firstName', 'lastName'],
        });

        coursData.formateurs = formateurs.map((formateur) =>
          formateur.toJSON(),
        );
      } else {
        coursData.formateurs = [];
      }

      // Remove the raw id_formateur array since we now have formateurs objects
      delete coursData.id_formateur;

      console.log('=== SessionCours findOne: Success ===');
      console.log('Session cours found:', coursData);

      return Responder({
        status: HttpStatusCode.Ok,
        data: coursData,
        customMessage: 'Session course retrieved successfully',
      });
    } catch (error) {
      console.error('=== SessionCours findOne: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while fetching session course',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async update(
    user: IJwtSignin,
    id: string,
    updateSessionCoursDto: UpdateSessionCoursDto,
  ): Promise<ResponseServer> {
    try {
      console.log('=== SessionCours update: Starting ===');
      console.log('Session cours ID:', id);
      console.log('Update DTO:', updateSessionCoursDto);
      console.log('User:', user);

      const sessionCours = await this.sessionCoursModel.findByPk(id);

      if (!sessionCours) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Session course not found',
        });
      }

      // Check if user has permission (same as course creator or secretary)
      if (sessionCours.createdBy !== user.id_user) {
        const dbUser = await this.usersModel.findOne({
          where: { id: user.id_user },
        });

        if (!dbUser || dbUser.role !== 'secretary') {
          return Responder({
            status: HttpStatusCode.Forbidden,
            data: 'You do not have permission to update this session course',
          });
        }
      }

      await sessionCours.update(updateSessionCoursDto);

      const updatedSessionCours = await this.sessionCoursModel.findByPk(id, {
        attributes: [
          'id',
          'title',
          'description',
          'is_published',
          'id_session',
          'id_formateur',
          'ponderation',
          'createdBy',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'CreatedBy',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: TrainingSession,
            required: false,
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
        ],
      });

      // Transform id_formateur array to include instructor details
      const coursData = updatedSessionCours?.toJSON() as any;

      if (
        coursData &&
        coursData.id_formateur &&
        coursData.id_formateur.length > 0
      ) {
        // Fetch instructor details for each formateur ID
        const formateurs = await this.usersModel.findAll({
          where: {
            id: coursData.id_formateur,
            role: 'instructor',
          },
          attributes: ['id', 'firstName', 'lastName'],
        });

        coursData.formateurs = formateurs.map((formateur) =>
          formateur.toJSON(),
        );
      } else if (coursData) {
        coursData.formateurs = [];
      }

      // Remove the raw id_formateur array since we now have formateurs objects
      if (coursData) {
        delete coursData.id_formateur;
      }

      console.log('=== SessionCours update: Success ===');
      console.log('Updated session cours:', coursData);

      return Responder({
        status: HttpStatusCode.Ok,
        data: coursData,
        customMessage: 'Session course updated successfully',
      });
    } catch (error) {
      console.error('=== SessionCours update: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while updating session course',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async remove(user: IJwtSignin, id: string): Promise<ResponseServer> {
    try {
      console.log('=== SessionCours remove: Starting ===');
      console.log('Session cours ID:', id);
      console.log('User:', user);

      const sessionCours = await this.sessionCoursModel.findByPk(id);

      if (!sessionCours) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Session course not found',
        });
      }

      // Check if user has permission (same as course creator or secretary)
      if (sessionCours.createdBy !== user.id_user) {
        const dbUser = await this.usersModel.findOne({
          where: { id: user.id_user },
        });

        if (!dbUser || dbUser.role !== 'secretary') {
          return Responder({
            status: HttpStatusCode.Forbidden,
            data: 'You do not have permission to delete this session course',
          });
        }
      }

      await sessionCours.destroy();

      console.log('=== SessionCours remove: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: { message: 'Session course deleted successfully' },
        customMessage: 'Session course deleted successfully',
      });
    } catch (error) {
      console.error('=== SessionCours remove: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while deleting session course',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findLessonsByCourseId(id_cours: string): Promise<ResponseServer> {
    try {
      console.log('=== SessionCours findLessonsByCourseId: Starting ===');
      console.log('Course ID:', id_cours);

      // First, validate that the session course exists
      const sessionCours = await this.sessionCoursModel.findByPk(id_cours);
      if (!sessionCours) {
        console.log(
          '=== SessionCours findLessonsByCourseId: Course not found ===',
        );
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session course not found',
        });
      }

      const lessons = await this.lessonModel.findAll({
        where: { id_cours: id_cours },
        attributes: [
          'id',
          'title',
          'description',
          'ispublish',
          'id_cours',
          'createdAt',
          'updatedAt',
        ],
        order: [['createdAt', 'ASC']],
      });

      console.log('=== SessionCours findLessonsByCourseId: Success ===');
      console.log('Lessons found:', lessons.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: lessons.length,
          rows: lessons,
        },
        customMessage: 'Lessons retrieved successfully',
      });
    } catch (error) {
      console.error('=== SessionCours findLessonsByCourseId: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving lessons',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
