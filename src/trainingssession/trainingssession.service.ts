import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TrainingSession } from '../models/model.trainingssession';
import { Training } from '../models/model.trainings';
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

      // Validate that available_places doesn't exceed nb_places
      if (
        createTrainingSessionDto.available_places >
        createTrainingSessionDto.nb_places
      ) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: 'Available places cannot exceed total places',
        });
      }

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
        available_places: createTrainingSessionDto.available_places,
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

      return Responder({
        status: HttpStatusCode.Ok,
        data: trainingSessions,
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

      return Responder({
        status: HttpStatusCode.Ok,
        data: trainingSession,
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

      // Validate available_places vs nb_places if both are being updated
      if (
        updateTrainingSessionDto.available_places !== undefined &&
        updateTrainingSessionDto.nb_places !== undefined
      ) {
        if (
          updateTrainingSessionDto.available_places >
          updateTrainingSessionDto.nb_places
        ) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: 'Available places cannot exceed total places',
          });
        }
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

      return Responder({
        status: HttpStatusCode.Ok,
        data: trainingSessions,
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
