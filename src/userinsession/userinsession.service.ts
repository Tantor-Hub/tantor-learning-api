import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserInSession } from '../models/model.userinsession';
import { TrainingSession } from '../models/model.trainingssession';
import { Training } from '../models/model.trainings';
import { Users } from '../models/model.users';
import { CreateUserInSessionDto } from './dto/create-userinsession.dto';
import { UpdateUserInSessionDto } from './dto/update-userinsession.dto';
import { DeleteUserInSessionDto } from './dto/delete-userinsession.dto';
import { Responder } from '../strategy/strategy.responder';
import { HttpStatusCode } from '../config/config.statuscodes';
import { UserInSessionStatus } from '../enums/user-in-session-status.enum';
import { MailService } from '../services/service.mail';

@Injectable()
export class UserInSessionService {
  constructor(
    @InjectModel(UserInSession)
    private userInSessionModel: typeof UserInSession,
    @InjectModel(TrainingSession)
    private trainingSessionModel: typeof TrainingSession,
    @InjectModel(Training)
    private trainingModel: typeof Training,
    @InjectModel(Users)
    private usersModel: typeof Users,
    private mailService: MailService,
  ) {}

  async create(createUserInSessionDto: CreateUserInSessionDto) {
    try {
      console.log(
        '[USER IN SESSION CREATE] Starting creation with data:',
        createUserInSessionDto,
      );

      // Verify that the training session exists
      const trainingSession = await this.trainingSessionModel.findByPk(
        createUserInSessionDto.id_session,
      );
      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Training session not found',
        });
      }

      // Verify that the user exists
      const user = await this.usersModel.findByPk(
        createUserInSessionDto.id_user,
      );
      if (!user) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'User not found',
        });
      }

      // Check if user is already in this session
      const existingUserInSession = await this.userInSessionModel.findOne({
        where: {
          id_session: createUserInSessionDto.id_session,
          id_user: createUserInSessionDto.id_user,
        },
      });

      if (existingUserInSession) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: null,
          customMessage: 'User is already in this session',
        });
      }

      // Check if session has available places
      if (trainingSession.available_places <= 0) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: null,
          customMessage: 'No available places in this session',
        });
      }

      let userInSession;
      try {
        userInSession = await this.userInSessionModel.create({
          id_session: createUserInSessionDto.id_session,
          status: createUserInSessionDto.status || UserInSessionStatus.PENDING,
          id_user: createUserInSessionDto.id_user,
        });
      } catch (error) {
        // Handle unique constraint violation (duplicate user-session combination)
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(
            '❌ [USER IN SESSION SERVICE] Duplicate user-session detected via database constraint',
          );
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: {
              errorType: 'DUPLICATE_USER_SESSION',
              sessionId: createUserInSessionDto.id_session,
              userId: createUserInSessionDto.id_user,
              message: 'Vous êtes déjà inscrit à cette session de formation.',
            },
            customMessage:
              'Vous êtes déjà inscrit à cette session de formation.',
          });
        }
        // Re-throw other errors
        throw error;
      }

      // Update available places in the session
      await trainingSession.update({
        available_places: trainingSession.available_places - 1,
      });

      // Fetch the created user in session with relationships
      const createdUserInSession = await this.userInSessionModel.findByPk(
        userInSession.id,
        {
          include: [
            {
              model: TrainingSession,
              as: 'trainingSession',
              required: false,
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
              as: 'user',
              required: false,
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            },
          ],
        },
      );

      if (!createdUserInSession) {
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: null,
          customMessage: 'Failed to retrieve created user in session',
        });
      }

      console.log(
        '[USER IN SESSION CREATE] ✅ Successfully created user in session:',
        createdUserInSession.toJSON(),
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: createdUserInSession,
        customMessage: 'User in session created successfully',
      });
    } catch (error) {
      console.error(
        '[USER IN SESSION CREATE] ❌ Error creating user in session:',
      );
      console.error('[USER IN SESSION CREATE] Error message:', error.message);
      console.error('[USER IN SESSION CREATE] Error stack:', error.stack);
      console.error('[USER IN SESSION CREATE] Full error object:', error);
      console.error(
        '[USER IN SESSION CREATE] Request data:',
        createUserInSessionDto,
      );

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          originalError: error.original || null,
        },
        customMessage: 'Failed to create user in session',
      });
    }
  }

  async createFreeSessionEnrollment(sessionId: string, userId: string) {
    try {
      console.log(
        '[FREE SESSION ENROLLMENT] Starting free session enrollment:',
        {
          userId,
          sessionId,
        },
      );

      // Step 1: Verify that the training session exists and get training price
      const trainingSession = await this.trainingSessionModel.findByPk(
        sessionId,
        {
          include: [
            {
              model: Training,
              as: 'trainings',
              required: false,
              attributes: ['id', 'title', 'prix'],
            },
          ],
        },
      );

      if (!trainingSession) {
        console.log(
          '❌ [FREE SESSION ENROLLMENT] Training session not found:',
          sessionId,
        );
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Session de formation non trouvée',
        });
      }

      // Step 2: Check if the training session is free (price = 0)
      const trainingPrice = parseFloat(
        String(trainingSession.trainings?.prix || '0'),
      );
      console.log(
        '💰 [FREE SESSION ENROLLMENT] Training price:',
        trainingPrice,
      );

      if (trainingPrice !== 0) {
        console.log(
          '❌ [FREE SESSION ENROLLMENT] Session is not free:',
          trainingPrice,
        );
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: {
            error: "Cette session de formation n'est pas gratuite",
            sessionPrice: trainingPrice,
          },
          customMessage: "Cette session de formation n'est pas gratuite",
        });
      }

      // Step 3: Check if user is already enrolled in this session
      const existingEnrollment = await this.userInSessionModel.findOne({
        where: {
          id_user: userId,
          id_session: sessionId,
        },
      });

      if (existingEnrollment) {
        console.log('❌ [FREE SESSION ENROLLMENT] User already enrolled:', {
          userId,
          sessionId,
        });
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: {
            error: 'Vous êtes déjà inscrit à cette session de formation',
            existingEnrollment: existingEnrollment.toJSON(),
          },
          customMessage: 'Vous êtes déjà inscrit à cette session de formation',
        });
      }

      // Step 4: Check if there are available places
      if (trainingSession.available_places <= 0) {
        console.log('❌ [FREE SESSION ENROLLMENT] No available places:', {
          availablePlaces: trainingSession.available_places,
        });
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: {
            error: 'Aucune place disponible pour cette session',
            availablePlaces: trainingSession.available_places,
            totalPlaces: trainingSession.nb_places,
          },
          customMessage: 'Aucune place disponible pour cette session',
        });
      }

      // Step 5: Create UserInSession with IN status
      console.log('✅ [FREE SESSION ENROLLMENT] Creating UserInSession...');

      const userInSession = await this.userInSessionModel.create({
        id_user: userId,
        id_session: sessionId,
        status: UserInSessionStatus.IN,
      });

      console.log(
        '✅ [FREE SESSION ENROLLMENT] UserInSession created:',
        userInSession.toJSON(),
      );

      // Step 6: Reduce available places for the training session
      await trainingSession.update({
        available_places: trainingSession.available_places - 1,
      });
      console.log('✅ [FREE SESSION ENROLLMENT] Available places reduced');

      // Step 7: Send enrollment confirmation email
      try {
        const user = await this.usersModel.findByPk(userId);
        if (user && user.email) {
          console.log(
            '📧 [FREE SESSION ENROLLMENT] Sending enrollment confirmation email...',
          );

          // Create a custom email template for free enrollment
          const emailContent = this.mailService.templates({
            as: 'payment-card-success',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            cours: trainingSession.trainings?.title || 'Formation gratuite',
            basePrice: 0,
            stripeFee: 0,
            totalAmount: 0,
          });

          await this.mailService.sendMail({
            to: user.email,
            subject:
              'Inscription gratuite confirmée - ' +
              (trainingSession.trainings?.title || 'Formation'),
            content: emailContent,
          });

          console.log(
            '✅ [FREE SESSION ENROLLMENT] Confirmation email sent successfully',
          );
        }
      } catch (emailError) {
        console.error(
          '❌ [FREE SESSION ENROLLMENT] Error sending email notification:',
          emailError,
        );
        // Don't fail the enrollment if email fails
      }

      console.log(
        '🎉 [FREE SESSION ENROLLMENT] Free session enrollment completed successfully!',
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: userInSession.toJSON(),
        customMessage: 'Inscription gratuite créée avec succès',
      });
    } catch (error) {
      console.error(
        '❌ [FREE SESSION ENROLLMENT] Error creating free session enrollment:',
        error,
      );
      console.error(
        '❌ [FREE SESSION ENROLLMENT] Error message:',
        error.message,
      );
      console.error('❌ [FREE SESSION ENROLLMENT] Error stack:', error.stack);
      console.error('❌ [FREE SESSION ENROLLMENT] Request data:', {
        userId,
        sessionId,
      });

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        customMessage: "Erreur lors de la création de l'inscription gratuite",
      });
    }
  }

  async findAll() {
    try {
      const usersInSessions = await this.userInSessionModel.findAll({
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
            include: [
              {
                model: Training,
                as: 'trainings',
                required: false,
                attributes: ['title', 'prix'],
              },
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'email',
              'phone',
              'address',
              'country',
              'city',
              'dateBirth',
              'role',
              'is_verified',
              'num_piece_identite',
              'avatar',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Calculate available places for each session
      const sessionsWithCalculatedPlaces = await Promise.all(
        usersInSessions.map(async (userInSession) => {
          if (userInSession.trainingSession) {
            const enrolledUsers = await this.userInSessionModel.count({
              where: { id_session: userInSession.trainingSession.id },
            });
            const availablePlaces =
              userInSession.trainingSession.nb_places - enrolledUsers;
            return {
              ...userInSession.toJSON(),
              trainingSession: {
                ...userInSession.trainingSession.toJSON(),
                available_places: availablePlaces,
              },
            };
          }
          return userInSession.toJSON();
        }),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionsWithCalculatedPlaces,
        customMessage: 'Users in sessions retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve users in sessions',
      });
    }
  }

  async findOne(id: string) {
    try {
      const userInSession = await this.userInSessionModel.findByPk(id, {
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
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
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
      });

      if (!userInSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'User in session not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: userInSession,
        customMessage: 'User in session retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve user in session',
      });
    }
  }

  async findByUserId(userId: string) {
    try {
      const usersInSessions = await this.userInSessionModel.findAll({
        where: {
          id_user: userId,
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
            include: [
              {
                model: Training,
                as: 'trainings',
                required: false,
                attributes: ['title'],
              },
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Format the response according to the required structure
      const formattedData = usersInSessions.map((userInSession) => ({
        status: userInSession.status,
        trainingSession: {
          id: userInSession.trainingSession?.id,
          title: userInSession.trainingSession?.title,
          begining_date: userInSession.trainingSession?.begining_date,
          ending_date: userInSession.trainingSession?.ending_date,
        },
        training: {
          title: userInSession.trainingSession?.trainings?.title,
        },
      }));

      return Responder({
        status: HttpStatusCode.Ok,
        data: formattedData,
        customMessage: 'Opération réussie.',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve user sessions',
      });
    }
  }

  async findBySessionId(sessionId: string) {
    try {
      const usersInSessions = await this.userInSessionModel.findAll({
        where: {
          id_session: sessionId,
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
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
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: usersInSessions,
        customMessage: 'Session participants retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve session participants',
      });
    }
  }

  async findByStatus(status: UserInSessionStatus) {
    try {
      const usersInSessions = await this.userInSessionModel.findAll({
        where: {
          status: status,
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
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
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: usersInSessions,
        customMessage: `Users with status ${status} retrieved successfully`,
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve users by status',
      });
    }
  }

  async update(updateUserInSessionDto: UpdateUserInSessionDto) {
    try {
      const { id, ...updateData } = updateUserInSessionDto;

      const userInSession = await this.userInSessionModel.findByPk(id);
      if (!userInSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'User in session not found',
        });
      }

      // If updating session reference, verify it exists
      if (updateData.id_session) {
        const trainingSession = await this.trainingSessionModel.findByPk(
          updateData.id_session,
        );
        if (!trainingSession) {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: null,
            customMessage: 'Training session not found',
          });
        }
      }

      // If updating user reference, verify it exists
      if (updateData.id_user) {
        const user = await this.usersModel.findByPk(updateData.id_user);
        if (!user) {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: null,
            customMessage: 'User not found',
          });
        }
      }

      await userInSession.update(updateData);

      // Fetch the updated user in session with relationships
      const updatedUserInSession = await this.userInSessionModel.findByPk(id, {
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
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
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: updatedUserInSession,
        customMessage: 'User in session updated successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to update user in session',
      });
    }
  }

  async remove(deleteUserInSessionDto: DeleteUserInSessionDto) {
    try {
      const { id } = deleteUserInSessionDto;

      const userInSession = await this.userInSessionModel.findByPk(id, {
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
          },
        ],
      });

      if (!userInSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'User in session not found',
        });
      }

      // Restore available place in the session
      if (userInSession.trainingSession) {
        await userInSession.trainingSession.update({
          available_places: userInSession.trainingSession.available_places + 1,
        });
      }

      await userInSession.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id },
        customMessage: 'User in session deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to delete user in session',
      });
    }
  }

  async findAllAdmin() {
    try {
      const usersInSessions = await this.userInSessionModel.findAll({
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: ['id', 'title'],
            include: [
              {
                model: Training,
                as: 'trainings',
                required: false,
                attributes: ['title'],
              },
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: [
              'id',
              'avatar',
              'email',
              'phone',
              'is_verified',
              'firstName',
              'lastName',
              'address',
              'country',
              'city',
              'dateBirth',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Format the response according to the required structure
      const formattedData = usersInSessions.map((userInSession) => ({
        status: userInSession.status,
        trainingSession: {
          id: userInSession.trainingSession?.id,
          title: userInSession.trainingSession?.title,
          trainings: {
            title: userInSession.trainingSession?.trainings?.title,
          },
        },
        user: {
          id: userInSession.user?.id,
          avatar: userInSession.user?.avatar,
          email: userInSession.user?.email,
          phone: userInSession.user?.phone,
          is_verified: userInSession.user?.is_verified,
          firstName: userInSession.user?.firstName,
          lastName: userInSession.user?.lastName,
          address: userInSession.user?.address,
          country: userInSession.user?.country,
          city: userInSession.user?.city,
          dateBirth: userInSession.user?.dateBirth,
        },
      }));

      return Responder({
        status: HttpStatusCode.Ok,
        data: formattedData,
        customMessage:
          'Users in sessions retrieved successfully (Admin access)',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve users in sessions',
      });
    }
  }

  async deleteAll() {
    try {
      const deletedCount = await this.userInSessionModel.destroy({
        where: {},
        truncate: true,
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: { deletedCount },
        customMessage: 'All users in sessions deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to delete all users in sessions',
      });
    }
  }
}
