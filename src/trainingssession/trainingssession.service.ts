import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { TrainingSession } from '../models/model.trainingssession';
import { Training } from '../models/model.trainings';
import { UserInSession } from '../models/model.userinsession';
import { CreateTrainingSessionDto } from './dto/create-trainingssession.dto';
import { UpdateTrainingSessionDto } from './dto/update-trainingssession.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { IInternalResponse } from '../interface/interface.internalresponse';
import { Responder } from '../strategy/strategy.responder';
import { HttpStatusCode } from '../config/config.statuscodes';

@Injectable()
export class TrainingSessionService {
  constructor(
    @InjectModel(TrainingSession)
    private readonly trainingSessionModel: typeof TrainingSession,
    @InjectModel(Training)
    private readonly trainingModel: typeof Training,
    @InjectModel(UserInSession)
    private readonly userInSessionModel: typeof UserInSession,
  ) {}

  async create(createTrainingSessionDto: CreateTrainingSessionDto) {
    try {
      // Verify that the training exists
      const training = await this.trainingModel.findByPk(
        createTrainingSessionDto.id_trainings,
      );
      if (!training) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Training not found',
        });
      }

      // Set available_places equal to nb_places initially
      const availablePlaces = createTrainingSessionDto.nb_places;

      // Validate that beginning date is before ending date
      const beginningDate = new Date(createTrainingSessionDto.begining_date);
      const endingDate = new Date(createTrainingSessionDto.ending_date);
      if (beginningDate >= endingDate) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: 'Beginning date must be before ending date',
        });
      }

      const trainingSession = await this.trainingSessionModel.create({
        id_trainings: createTrainingSessionDto.id_trainings,
        title: createTrainingSessionDto.title,
        nb_places: createTrainingSessionDto.nb_places,
        available_places: availablePlaces,
        required_document_before:
          createTrainingSessionDto.required_document_before,
        required_document_during:
          createTrainingSessionDto.required_document_during,
        required_document_after:
          createTrainingSessionDto.required_document_after,
        payment_method: createTrainingSessionDto.payment_method,
        survey: createTrainingSessionDto.survey,
        regulation_text: createTrainingSessionDto.regulation_text,
        begining_date: beginningDate,
        ending_date: endingDate,
      });

      // Fetch the created training session with its training relationship
      const createdTrainingSession = await this.trainingSessionModel.findByPk(
        trainingSession.id,
        {
          include: [
            {
              model: Training,
              as: 'trainings',
              attributes: [
                'id',
                'title',
                'subtitle',
                'description',
                'trainingtype',
                'prix',
              ],
            },
          ],
        },
      );

      return Responder({
        status: HttpStatusCode.Created,
        data: createdTrainingSession,
        customMessage: 'Training session created successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error creating training session',
      });
    }
  }

  async findAll() {
    try {
      const trainingSessions = await this.trainingSessionModel.findAll({
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: [
              'id',
              'title',
              'subtitle',
              'description',
              'trainingtype',
              'prix',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Calculate available places for each session
      const sessionsWithAvailablePlaces = await Promise.all(
        trainingSessions.map(async (session) => {
          const enrolledUsers = await this.userInSessionModel.count({
            where: {
              id_session: session.id,
              status: {
                [Op.notIn]: ['refusedpayment', 'notpaid', 'out'],
              },
            },
          });
          const availablePlaces = session.nb_places - enrolledUsers;
          return {
            ...session.toJSON(),
            available_places: availablePlaces,
          };
        }),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionsWithAvailablePlaces,
        customMessage: 'Training sessions retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error fetching training sessions',
      });
    }
  }

  async findOne(id: string) {
    try {
      const trainingSession = await this.trainingSessionModel.findByPk(id, {
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: [
              'id',
              'title',
              'subtitle',
              'description',
              'trainingtype',
              'prix',
            ],
          },
        ],
      });

      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Training session not found',
        });
      }

      // Calculate available places
      const enrolledUsers = await this.userInSessionModel.count({
        where: {
          id_session: id,
          status: {
            [Op.notIn]: ['refusedpayment', 'notpaid', 'out'],
          },
        },
      });
      const availablePlaces = trainingSession.nb_places - enrolledUsers;
      const sessionWithAvailablePlaces = {
        ...trainingSession.toJSON(),
        available_places: availablePlaces,
      };

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionWithAvailablePlaces,
        customMessage: 'Training session retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error fetching training session',
      });
    }
  }

  async findOneForStudent(id: string) {
    try {
      const trainingSession = await this.trainingSessionModel.findByPk(id, {
        attributes: [
          'id',
          'title',
          'payment_method',
          'cpf_link',
          'survey',
          'regulation_text',
          'begining_date',
          'ending_date',
        ],
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: [
              'title',
              'subtitle',
              'description',
              'trainingtype',
              'prix',
            ],
          },
        ],
      });

      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Training session not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: trainingSession,
        customMessage: 'Opération réussie.',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error fetching training session',
      });
    }
  }

  async update(id: string, updateTrainingSessionDto: UpdateTrainingSessionDto) {
    try {
      const trainingSession = await this.trainingSessionModel.findByPk(id);
      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Training session not found',
        });
      }

      // If updating training reference, verify it exists
      if (updateTrainingSessionDto.id_trainings) {
        const training = await this.trainingModel.findByPk(
          updateTrainingSessionDto.id_trainings,
        );
        if (!training) {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: 'Training not found',
          });
        }
      }

      // If nb_places is being updated, also update available_places to match
      if (updateTrainingSessionDto.nb_places !== undefined) {
        (updateTrainingSessionDto as any).available_places =
          updateTrainingSessionDto.nb_places;
      }

      // Validate dates if both are being updated
      if (
        updateTrainingSessionDto.begining_date &&
        updateTrainingSessionDto.ending_date
      ) {
        const beginningDate = new Date(updateTrainingSessionDto.begining_date);
        const endingDate = new Date(updateTrainingSessionDto.ending_date);
        if (beginningDate >= endingDate) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: 'Beginning date must be before ending date',
          });
        }
      }

      // Convert date strings to Date objects if provided
      const updateData: any = { ...updateTrainingSessionDto };
      if (updateTrainingSessionDto.begining_date) {
        updateData.begining_date = new Date(
          updateTrainingSessionDto.begining_date,
        );
      }
      if (updateTrainingSessionDto.ending_date) {
        updateData.ending_date = new Date(updateTrainingSessionDto.ending_date);
      }

      await trainingSession.update(updateData);

      // Fetch the updated training session with its training relationship
      const updatedTrainingSession = await this.trainingSessionModel.findByPk(
        id,
        {
          include: [
            {
              model: Training,
              as: 'trainings',
              attributes: [
                'id',
                'title',
                'subtitle',
                'description',
                'trainingtype',
                'prix',
              ],
            },
          ],
        },
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: updatedTrainingSession,
        customMessage: 'Training session updated successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error updating training session',
      });
    }
  }

  async updatePayment(updatePaymentDto: UpdatePaymentDto) {
    try {
      const trainingSession = await this.trainingSessionModel.findByPk(
        updatePaymentDto.id,
      );
      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Training session not found',
        });
      }

      // Only update payment-related fields
      const updateData: any = {};
      if (updatePaymentDto.payment_method !== undefined) {
        updateData.payment_method = updatePaymentDto.payment_method;
      }
      if (updatePaymentDto.cpf_link !== undefined) {
        updateData.cpf_link = updatePaymentDto.cpf_link;
      }

      await trainingSession.update(updateData);

      return Responder({
        status: HttpStatusCode.Ok,
        data: trainingSession,
        customMessage: 'Payment information updated successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error updating payment information',
      });
    }
  }

  async remove(id: string) {
    try {
      const trainingSession = await this.trainingSessionModel.findByPk(id);
      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Training session not found',
        });
      }

      await trainingSession.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id },
        customMessage: 'Training session deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error deleting training session',
      });
    }
  }

  async findByTrainingId(trainingId: string) {
    try {
      const trainingSessions = await this.trainingSessionModel.findAll({
        where: {
          id_trainings: trainingId,
        },
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: ['title', 'subtitle', 'description'],
          },
        ],
        order: [['begining_date', 'ASC']],
      });

      // Calculate available places for each session
      const sessionsWithAvailablePlaces = await Promise.all(
        trainingSessions.map(async (session) => {
          const enrolledUsers = await this.userInSessionModel.count({
            where: {
              id_session: session.id,
              status: {
                [Op.notIn]: ['refusedpayment', 'notpaid', 'out'],
              },
            },
          });
          const availablePlaces = session.nb_places - enrolledUsers;
          return {
            ...session.toJSON(),
            available_places: availablePlaces,
          };
        }),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: sessionsWithAvailablePlaces,
        customMessage: 'Training sessions retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error fetching training sessions by training ID',
      });
    }
  }

  async findByTrainingIdForStudent(trainingId: string) {
    try {
      const trainingSessions = await this.trainingSessionModel.findAll({
        where: {
          id_trainings: trainingId,
        },
        attributes: [
          'id',
          'title',
          'nb_places',
          'available_places',
          'begining_date',
          'ending_date',
          'createdAt',
          'updatedAt',
          'payment_method',
        ],
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: ['title', 'subtitle', 'description', 'prix'],
          },
        ],
        order: [['begining_date', 'ASC']],
      });

      // Calculate available places and filter sessions
      const sessionsWithAvailablePlaces = await Promise.all(
        trainingSessions.map(async (session) => {
          const enrolledUsers = await this.userInSessionModel.count({
            where: {
              id_session: session.id,
              status: {
                [Op.notIn]: ['refusedpayment', 'notpaid', 'out'],
              },
            },
          });
          const availablePlaces = session.nb_places - enrolledUsers;
          return {
            ...session.toJSON(),
            available_places: availablePlaces,
          };
        }),
      );

      // Filter out training sessions with empty payment_method when training prix > 0
      const filteredSessions = sessionsWithAvailablePlaces.filter((session) => {
        const training = (session as any).trainings;
        const prix = parseFloat(training?.prix || '0');

        // If training has a price > 0, ensure payment_method is not empty
        if (prix > 0) {
          return session.payment_method && session.payment_method.length > 0;
        }

        // If training is free (prix = 0), include the session regardless of payment_method
        return true;
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: filteredSessions,
        customMessage: 'Training sessions retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Error fetching training sessions by training ID',
      });
    }
  }
}
