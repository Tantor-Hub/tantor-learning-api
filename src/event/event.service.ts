import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from 'src/models/model.event';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Training } from 'src/models/model.trainings';
import { TrainingSession } from 'src/models/model.trainingssession';
import { SessionCours } from 'src/models/model.sessioncours';
import { Lesson } from 'src/models/model.lesson';
import { Users } from 'src/models/model.users';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<ResponseServer> {
    try {
      const event = await this.eventModel.create({
        ...createEventDto,
        begining_date: new Date(createEventDto.begining_date),
        beginning_hour: createEventDto.beginning_hour,
        ending_hour: createEventDto.ending_hour,
      } as any);

      return Responder({
        status: HttpStatusCode.Created,
        data: event,
        customMessage: 'Event created successfully',
      });
    } catch (error) {
      console.error('Error creating event:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error creating event',
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const events = await this.eventModel.findAll({
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: ['id', 'title'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title'],
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['begining_date', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: events,
        customMessage: 'Events retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving events:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving events',
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const event = await this.eventModel.findByPk(id, {
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: ['id', 'title'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title'],
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      if (!event) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Event not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: event,
        customMessage: 'Event retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving event:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving event',
      });
    }
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<ResponseServer> {
    try {
      const event = await this.eventModel.findByPk(id);

      if (!event) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Event not found',
        });
      }

      const updateData: any = { ...updateEventDto };

      // Convert date string to Date object if provided
      if (updateEventDto.begining_date) {
        updateData.begining_date = new Date(updateEventDto.begining_date);
      }

      // All other fields (title, description, beginning_hour, ending_hour,
      // id_cible_training, id_cible_session, id_cible_cours, id_cible_lesson, id_cible_user)
      // are already handled by the spread operator above

      await event.update(updateData);

      return Responder({
        status: HttpStatusCode.Ok,
        data: event,
        customMessage: 'Event updated successfully',
      });
    } catch (error) {
      console.error('Error updating event:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error updating event',
      });
    }
  }

  async remove(id: string): Promise<ResponseServer> {
    try {
      const event = await this.eventModel.findByPk(id);

      if (!event) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Event not found',
        });
      }

      await event.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        customMessage: 'Event deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error deleting event',
      });
    }
  }

  async findByTraining(trainingId: string): Promise<ResponseServer> {
    try {
      const events = await this.eventModel.findAll({
        where: {
          id_cible_training: {
            [require('sequelize').Op.contains]: [trainingId],
          },
        },
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: ['id', 'title'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title'],
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['begining_date', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: events,
        customMessage: 'Events retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving events by training:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving events',
      });
    }
  }

  async findBySession(sessionId: string): Promise<ResponseServer> {
    try {
      const events = await this.eventModel.findAll({
        where: {
          [require('sequelize').Op.or]: [
            // Direct session match
            { id_cible_session: sessionId },
            // Session match through sessionCours
            {
              '$sessionCours.id_session$': sessionId,
            },
          ],
        },
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: ['id', 'title'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'id_session'],
            required: false, // LEFT JOIN to include events without sessionCours
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['begining_date', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: events,
        customMessage: 'Events retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving events by session:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving events',
      });
    }
  }

  async findByUser(userId: string): Promise<ResponseServer> {
    try {
      const events = await this.eventModel.findAll({
        where: {
          createdBy: userId,
        },
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: ['id', 'title'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title'],
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['begining_date', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: events,
        customMessage: 'Events retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving events by user:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving events',
      });
    }
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ResponseServer> {
    try {
      const events = await this.eventModel.findAll({
        where: {
          begining_date: {
            [require('sequelize').Op.between]: [
              new Date(startDate),
              new Date(endDate),
            ],
          },
        },
        include: [
          {
            model: Training,
            as: 'trainings',
            attributes: ['id', 'title'],
          },
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title'],
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['begining_date', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: events,
        customMessage: 'Events retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving events by date range:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving events',
      });
    }
  }
}
