import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
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
import { UserInSession } from 'src/models/model.userinsession';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import * as QRCode from 'qrcode';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Lesson)
    private readonly lessonModel: typeof Lesson,
    @InjectModel(SessionCours)
    private readonly sessionCoursModel: typeof SessionCours,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
    @InjectModel(UserInSession)
    private readonly userInSessionModel: typeof UserInSession,
    private readonly configService: ConfigService,
  ) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloud_name'),
      api_key: this.configService.get<string>('cloudinary.api_key'),
      api_secret: this.configService.get<string>('cloudinary.api_secret'),
    });
  }

  private async fetchLessonsForEvent(event: Event): Promise<Lesson[]> {
    if (!event.id_cible_lesson || event.id_cible_lesson.length === 0) {
      return [];
    }

    return await this.lessonModel.findAll({
      where: {
        id: {
          [require('sequelize').Op.in]: event.id_cible_lesson,
        },
      },
      attributes: ['id', 'title'],
    });
  }

  /**
   * Helper method to determine session ID from an event
   * Checks id_cible_session, id_cible_cours, and id_cible_lesson in priority order
   */
  private async getSessionIdFromEvent(event: Event): Promise<string | null> {
    // Priority 1: Check if event has a direct session reference
    if (event.id_cible_session) {
      return event.id_cible_session;
    }
    // Priority 2: Get session from id_cible_cours
    if (event.id_cible_cours) {
      const sessionCours = await this.sessionCoursModel.findByPk(
        event.id_cible_cours,
        {
          attributes: ['id', 'id_session'],
        },
      );
      if (sessionCours && sessionCours.id_session) {
        return sessionCours.id_session;
      }
    }
    // Priority 3: Get session from id_cible_lesson
    if (event.id_cible_lesson && event.id_cible_lesson.length > 0) {
      const lesson = await this.lessonModel.findByPk(event.id_cible_lesson[0], {
        attributes: ['id', 'id_cours'],
      });

      if (lesson && lesson.id_cours) {
        const sessionCours = await this.sessionCoursModel.findByPk(
          lesson.id_cours,
          {
            attributes: ['id', 'id_session'],
          },
        );

        if (sessionCours && sessionCours.id_session) {
          return sessionCours.id_session;
        }
      }
    }
    return null;
  }

  /**
   * Helper method to get students in session with participation status
   */
  private async getStudentsWithParticipationStatus(
    sessionId: string | null,
    eventParticipants: string[] = [],
  ): Promise<{
    students: Array<{
      id: string;
      firstName: string | undefined;
      lastName: string | undefined;
      email: string;
      phone?: string;
      avatar?: string;
      userInSessionId: string;
      status: string;
      participated: boolean;
    }>;
    totalInSession: number;
    participantsCount: number;
    absentCount: number;
  }> {
    if (!sessionId) {
      return {
        students: [],
        totalInSession: 0,
        participantsCount: 0,
        absentCount: 0,
      };
    }

    // Get all users in the session from UserInSession
    const usersInSession = await this.userInSessionModel.findAll({
      where: {
        id_session: sessionId,
      },
      include: [
        {
          model: Users,
          as: 'user',
          required: true,
          attributes: [
            'id',
            'firstName',
            'lastName',
            'email',
            'phone',
            'avatar',
          ],
        },
      ],
    });

    // Map users with participation status
    const students = usersInSession.map((userInSession) => ({
      id: userInSession.user.id,
      firstName: userInSession.user.firstName,
      lastName: userInSession.user.lastName,
      email: userInSession.user.email,
      phone: userInSession.user.phone,
      avatar: userInSession.user.avatar,
      userInSessionId: userInSession.id,
      status: userInSession.status,
      participated: eventParticipants.includes(userInSession.id_user),
    }));

    const participantsCount = students.filter((s) => s.participated).length;
    const absentCount = students.filter((s) => !s.participated).length;

    return {
      students,
      totalInSession: usersInSession.length,
      participantsCount,
      absentCount,
    };
  }

  async createForLesson(
    createEventDto: CreateEventDto,
  ): Promise<ResponseServer> {
    try {
      // Validate that id_cible_lesson is provided and not empty
      if (
        !createEventDto.id_cible_lesson ||
        createEventDto.id_cible_lesson.length === 0
      ) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'At least one lesson ID is required',
        });
      }

      // Fetch the lessons to get their sessioncours IDs
      const lessons = await this.lessonModel.findAll({
        where: {
          id: {
            [require('sequelize').Op.in]: createEventDto.id_cible_lesson,
          },
        },
        attributes: ['id', 'id_cours'],
      });

      if (lessons.length === 0) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'No lessons found with the provided IDs',
        });
      }

      if (lessons.length !== createEventDto.id_cible_lesson.length) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Some lesson IDs are invalid',
        });
      }

      // Get unique sessioncours IDs from the lessons
      const sessionCoursIds = [
        ...new Set(lessons.map((lesson) => lesson.id_cours).filter(Boolean)),
      ];

      if (sessionCoursIds.length === 0) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Lessons must be associated with a session course',
        });
      }

      // If lessons belong to different sessioncours, use the first one
      // (or you could throw an error if you want to enforce same sessioncours)
      if (sessionCoursIds.length > 1) {
        console.warn(
          `Warning: Lessons belong to different sessioncours. Using the first one: ${sessionCoursIds[0]}`,
        );
      }

      // Set id_cible_cours to the first sessioncours ID
      const eventData: CreateEventDto = {
        ...createEventDto,
        id_cible_cours: sessionCoursIds[0],
      };

      // Create the event using the regular create method
      return await this.create(eventData);
    } catch (error) {
      console.error('Error creating event for lesson:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error creating event for lesson',
      });
    }
  }

  async create(createEventDto: CreateEventDto): Promise<ResponseServer> {
    try {
      // Prepare the event data
      const eventData: any = {
        title: createEventDto.title,
        description: createEventDto.description,
        id_cible_training: createEventDto.id_cible_training,
        id_cible_session: createEventDto.id_cible_session,
        id_cible_cours: createEventDto.id_cible_cours,
        id_cible_user: createEventDto.id_cible_user,
        begining_date: new Date(createEventDto.begining_date),
        beginning_hour: createEventDto.beginning_hour,
        ending_hour: createEventDto.ending_hour,
        createdBy: createEventDto.createdBy,
        qrcode: createEventDto.qrcode,
        participant: createEventDto.participant,
      };

      // Set id_cible_lesson as a proper array - ensure it's not undefined
      if (createEventDto.id_cible_lesson) {
        eventData.id_cible_lesson = Array.isArray(
          createEventDto.id_cible_lesson,
        )
          ? createEventDto.id_cible_lesson
          : [createEventDto.id_cible_lesson];
      }

      // Create the event first to get the ID
      const event = await this.eventModel.create(eventData);

      // If id_cible_lesson exists and has at least one value, generate and upload QR code
      if (
        createEventDto.id_cible_lesson &&
        createEventDto.id_cible_lesson.length > 0
      ) {
        try {
          // Generate QR code containing the event ID
          const qrCodeBuffer = await QRCode.toBuffer(event.id, {
            type: 'png',
            width: 300,
            margin: 2,
          });

          // Upload QR code directly to Cloudinary
          const uploadResult = await new Promise<{
            secure_url: string;
            public_id: string;
          }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: '__tantorLearning/qrcodes',
                resource_type: 'image',
                public_id: `event-${event.id}-qrcode`,
                format: 'png',
                overwrite: true,
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve({
                    secure_url: result!.secure_url,
                    public_id: result!.public_id,
                  });
                }
              },
            );
            uploadStream.end(qrCodeBuffer);
          });

          if (uploadResult && uploadResult.secure_url) {
            // Update the event with the QR code URL
            await event.update({ qrcode: uploadResult.secure_url });
            // Reload the event to get the updated data
            await event.reload();
          }
        } catch (qrError) {
          console.error('Error generating/uploading QR code:', qrError);
          // Continue even if QR code generation fails - event is still created
        }
      }

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

      // Manually fetch lessons and participation info for all events
      const eventsWithLessonsAndParticipation = await Promise.all(
        events.map(async (event) => {
          const lessons = await this.fetchLessonsForEvent(event);
          const sessionId = await this.getSessionIdFromEvent(event);
          const participants = event.participant || [];
          const participationInfo =
            await this.getStudentsWithParticipationStatus(
              sessionId,
              participants,
            );

          const eventData = event.toJSON();
          // Remove participant field since we have participationInfo
          delete eventData.participant;

          return {
            ...eventData,
            lessons: lessons,
            sessionId: sessionId,
            participationInfo: {
              students: participationInfo.students,
              totalInSession: participationInfo.totalInSession,
              participantsCount: participationInfo.participantsCount,
              absentCount: participationInfo.absentCount,
            },
          };
        }),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: eventsWithLessonsAndParticipation,
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

      // Manually fetch lessons based on id_cible_lesson array
      const lessons = await this.fetchLessonsForEvent(event);

      // Add lessons to the event data
      const eventData = {
        ...event.toJSON(),
        lessons: lessons,
      };

      return Responder({
        status: HttpStatusCode.Ok,
        data: eventData,
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

  async findOneForSecretary(id: string): Promise<ResponseServer> {
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

      // Manually fetch lessons based on id_cible_lesson array
      const lessons = await this.fetchLessonsForEvent(event);

      // Get session ID and participation info
      const sessionId = await this.getSessionIdFromEvent(event);
      const participants = event.participant || [];
      const participationInfo = await this.getStudentsWithParticipationStatus(
        sessionId,
        participants,
      );

      const eventData = event.toJSON();
      // Remove participant field since we have participationInfo
      delete eventData.participant;

      // Add lessons, sessionId, and participationInfo to the event data
      const eventDataWithParticipation = {
        ...eventData,
        lessons: lessons,
        sessionId: sessionId,
        participationInfo: {
          students: participationInfo.students,
          totalInSession: participationInfo.totalInSession,
          participantsCount: participationInfo.participantsCount,
          absentCount: participationInfo.absentCount,
        },
      };

      return Responder({
        status: HttpStatusCode.Ok,
        data: eventDataWithParticipation,
        customMessage: 'Event retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving event for secretary:', error);
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
      console.log('=== Event Update Debug ===');
      console.log('Received id:', id, 'Type:', typeof id);
      console.log('Update data:', updateEventDto);

      if (!id || id === 'undefined' || id === 'null') {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Invalid event ID provided',
        });
      }

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
      await event.reload(); // Reload to get the updated data from database

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

      // Check if event has participants
      if (event.participant && event.participant.length > 0) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage:
            "Impossible de supprimer un événement avec des participants. Veuillez retirer tous les participants avant de supprimer l'événement.",
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

      // Manually fetch lessons for all events
      const eventsWithLessons = await Promise.all(
        events.map(async (event) => {
          const lessons = await this.fetchLessonsForEvent(event);
          return {
            ...event.toJSON(),
            lessons: lessons,
          };
        }),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: eventsWithLessons,
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

      // Manually fetch lessons for all events
      const eventsWithLessons = await Promise.all(
        events.map(async (event) => {
          const lessons = await this.fetchLessonsForEvent(event);
          return {
            ...event.toJSON(),
            lessons: lessons,
          };
        }),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: eventsWithLessons,
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

      // Manually fetch lessons for all events
      const eventsWithLessons = await Promise.all(
        events.map(async (event) => {
          const lessons = await this.fetchLessonsForEvent(event);
          return {
            ...event.toJSON(),
            lessons: lessons,
          };
        }),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: eventsWithLessons,
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

      // Manually fetch lessons for all events
      const eventsWithLessons = await Promise.all(
        events.map(async (event) => {
          const lessons = await this.fetchLessonsForEvent(event);
          return {
            ...event.toJSON(),
            lessons: lessons,
          };
        }),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: eventsWithLessons,
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

  async findByInstructorCourses(user: IJwtSignin): Promise<ResponseServer> {
    try {
      console.log('=== Event findByInstructorCourses: Starting ===');
      console.log('User:', user);
      console.log('Instructor ID from token:', user.id_user);

      // First, get all sessioncours where the instructor is assigned
      const sessionCours = await SessionCours.findAll({
        where: {
          id_formateur: {
            [require('sequelize').Op.contains]: [user.id_user],
          },
        },
        attributes: ['id', 'title', 'id_session'],
      });

      console.log('SessionCours found for instructor:', sessionCours.length);

      if (sessionCours.length === 0) {
        return Responder({
          status: HttpStatusCode.Ok,
          data: {
            length: 0,
            rows: [],
          },
          customMessage: 'No session courses found for this instructor',
        });
      }

      // Extract sessioncours IDs and session IDs
      const sessionCoursIds = sessionCours.map((sc) => sc.id);
      const sessionIds = sessionCours
        .map((sc) => sc.id_session)
        .filter(Boolean);

      console.log('SessionCours IDs:', sessionCoursIds);
      console.log('Session IDs:', sessionIds);

      // Find events that are either:
      // 1. Directly linked to sessioncours (id_cible_cours)
      // 2. Linked to sessions that contain these sessioncours (id_cible_session)
      const events = await this.eventModel.findAll({
        where: {
          [require('sequelize').Op.or]: [
            // Events directly linked to sessioncours
            {
              id_cible_cours: {
                [require('sequelize').Op.in]: sessionCoursIds,
              },
            },
            // Events linked to sessions that contain these sessioncours
            {
              id_cible_session: {
                [require('sequelize').Op.in]: sessionIds,
              },
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
            attributes: ['id', 'title', 'id_session', 'id_formateur'],
            required: false,
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

      // Manually fetch lessons for all events
      const eventsWithLessons = await Promise.all(
        events.map(async (event) => {
          const lessons = await this.fetchLessonsForEvent(event);
          return {
            ...event.toJSON(),
            lessons: lessons,
          };
        }),
      );

      console.log('=== Event findByInstructorCourses: Success ===');
      console.log('Events found:', eventsWithLessons.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: eventsWithLessons.length,
          rows: eventsWithLessons,
        },
        customMessage: 'Events for instructor courses retrieved successfully',
      });
    } catch (error) {
      console.error('=== Event findByInstructorCourses: ERROR ===');
      console.error('Error retrieving events for instructor courses:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving events for instructor courses',
      });
    }
  }

  async findBySessionForStudent(sessionId: string): Promise<ResponseServer> {
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
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title'],
            required: false,
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
          },
        ],
        order: [['begining_date', 'ASC']],
      });

      // Format the response according to the specified structure
      const formattedData = await Promise.all(
        events.map(async (event) => {
          const lessons = await this.fetchLessonsForEvent(event);
          return {
            id: event.id,
            title: event.title,
            description: event.description,
            begining_date: event.begining_date.toISOString(),
            beginning_hour: event.beginning_hour,
            ending_hour: event.ending_hour,
            createdBy: event.createdBy,
            sessionCours: event.sessionCours
              ? {
                  id: event.sessionCours.id,
                  title: event.sessionCours.title,
                }
              : undefined,
            creator: event.creator
              ? {
                  id: event.creator.id,
                  firstName: event.creator.firstName,
                  lastName: event.creator.lastName,
                  email: event.creator.email,
                }
              : undefined,
            lessons: lessons,
          };
        }),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: formattedData,
        customMessage: 'Events retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving events by session for student:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving events',
      });
    }
  }

  async addStudentToEvent(
    eventId: string,
    studentId: string,
  ): Promise<ResponseServer> {
    try {
      // Find the event
      const event = await this.eventModel.findByPk(eventId);
      if (!event) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Event not found',
        });
      }

      // Get current participant IDs or initialize empty array
      const currentParticipants = event.participant || [];

      // Check if student is already a participant
      if (currentParticipants.includes(studentId)) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Student is already a participant in this event',
        });
      }

      // Add student to the participant array
      const updatedParticipants = [...currentParticipants, studentId];
      await event.update({ participant: updatedParticipants });

      // Reload to get updated data
      await event.reload();

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          eventId,
          studentId,
          totalParticipants: updatedParticipants.length,
          participant: updatedParticipants,
        },
        customMessage: 'Student added to event successfully',
      });
    } catch (error) {
      console.error('Error adding student to event:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error adding student to event',
      });
    }
  }

  private getProgressionStatus(progression: number): string {
    if (progression >= 80) {
      return 'excellent';
    } else if (progression >= 60) {
      return 'strong';
    } else if (progression >= 40) {
      return 'average';
    } else if (progression >= 20) {
      return 'weak';
    } else {
      return 'very_weak';
    }
  }

  async getStudentsAttendanceForInstructor(
    user: IJwtSignin,
  ): Promise<ResponseServer> {
    try {
      console.log('=== getStudentsAttendanceForInstructor: Starting ===');
      console.log('Instructor ID:', user.id_user);

      // Get all sessioncours where the instructor is assigned
      const sessionCours = await this.sessionCoursModel.findAll({
        where: {
          id_formateur: {
            [require('sequelize').Op.contains]: [user.id_user],
          },
        },
        attributes: ['id', 'title'],
        include: [
          {
            model: Lesson,
            as: 'lessons',
            attributes: ['id'],
          },
        ],
      });

      console.log('SessionCours found:', sessionCours.length);

      if (sessionCours.length === 0) {
        return Responder({
          status: HttpStatusCode.Ok,
          data: {
            length: 0,
            rows: [],
          },
          customMessage: 'No session courses found for this instructor',
        });
      }

      const result: any[] = [];

      // Process each sessioncours
      for (const sessionCour of sessionCours) {
        const sessionCoursId = sessionCour.id;
        const sessionCoursTitle = sessionCour.title || 'Untitled Session';

        // Get all lesson IDs for this sessioncours
        const lessonIds = sessionCour.lessons?.map((lesson) => lesson.id) || [];

        // Find all events for this sessioncours:
        // 1. Events directly linked to sessioncours (id_cible_cours)
        // 2. Events linked to lessons in this sessioncours (id_cible_lesson contains any lesson ID)
        const Sequelize = require('sequelize');
        const events = await this.eventModel.findAll({
          where: {
            [Sequelize.Op.or]: [
              // Events directly linked to sessioncours
              { id_cible_cours: sessionCoursId },
              // Events linked to lessons in this sessioncours
              // Check if id_cible_lesson array contains any of the lesson IDs
              ...(lessonIds.length > 0
                ? lessonIds.map((lessonId) => ({
                    id_cible_lesson: {
                      [Sequelize.Op.contains]: [lessonId],
                    },
                  }))
                : []),
            ],
          },
          attributes: ['id', 'begining_date', 'participant'],
        });

        console.log(
          `Found ${events.length} events for sessioncours: ${sessionCoursTitle}`,
        );

        // Calculate total events count
        const totalEvents = events.length;

        if (totalEvents === 0) {
          continue; // Skip if no events
        }

        // Collect all unique student IDs who attended any event
        const studentEventMap = new Map<string, Set<string>>(); // studentId -> Set of event IDs

        events.forEach((event) => {
          if (event.participant && event.participant.length > 0) {
            event.participant.forEach((studentId) => {
              if (!studentEventMap.has(studentId)) {
                studentEventMap.set(studentId, new Set());
              }
              studentEventMap.get(studentId)?.add(event.id);
            });
          }
        });

        // Get student details and calculate progression
        const studentIds = Array.from(studentEventMap.keys());

        if (studentIds.length === 0) {
          continue; // Skip if no students attended
        }

        const students = await this.usersModel.findAll({
          where: {
            id: {
              [require('sequelize').Op.in]: studentIds,
            },
          },
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
        });

        // Build result for each student
        students.forEach((student) => {
          const studentId = student.id;
          const attendedEvents = studentEventMap.get(studentId) || new Set();
          const attendedCount = attendedEvents.size;
          const progression =
            totalEvents > 0 ? (attendedCount / totalEvents) * 100 : 0;
          const roundedProgression = Math.round(progression * 100) / 100; // Round to 2 decimal places
          const progressionStatus =
            this.getProgressionStatus(roundedProgression);

          // Get all event dates for this student
          const eventDates = events
            .filter((event) => attendedEvents.has(event.id))
            .map((event) => event.begining_date.toISOString().split('T')[0])
            .sort();

          result.push({
            studentId: student.id,
            studentName:
              `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
              'Unknown',
            studentEmail: student.email,
            studentAvatar: student.avatar || null,
            sessionCoursTitle: sessionCoursTitle,
            progression: roundedProgression,
            progressionStatus: progressionStatus,
            eventsAttended: attendedCount,
            totalEvents: totalEvents,
            eventDates: eventDates,
          });
        });
      }

      console.log('=== getStudentsAttendanceForInstructor: Success ===');
      console.log('Total students found:', result.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: result.length,
          rows: result,
        },
        customMessage: 'Student attendance data retrieved successfully',
      });
    } catch (error) {
      console.error('=== getStudentsAttendanceForInstructor: ERROR ===', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student attendance data',
      });
    }
  }

  async getPastEventsOrderedByDate(): Promise<ResponseServer> {
    try {
      console.log('=== getPastEventsOrderedByDate: Starting ===');

      const now = new Date();

      // Get all events that have already happened (begining_date is in the past)
      const events = await this.eventModel.findAll({
        where: {
          begining_date: {
            [require('sequelize').Op.lt]: now,
          },
        },
        order: [['begining_date', 'ASC']],
      });

      // Format events with participant count
      const eventsWithParticipantCount = events.map((event) => {
        const participantCount = event.participant
          ? event.participant.length
          : 0;

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          begining_date: event.begining_date,
          participantCount: participantCount,
        };
      });

      console.log('=== getPastEventsOrderedByDate: Success ===');
      console.log(`Found ${eventsWithParticipantCount.length} past events`);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: eventsWithParticipantCount.length,
          rows: eventsWithParticipantCount,
        },
        customMessage: 'Past events retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving past events:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving past events',
      });
    }
  }

  async getAbsentStudents(eventId: string): Promise<ResponseServer> {
    try {
      // Find the event
      const event = await this.eventModel.findByPk(eventId);

      if (!event) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Event not found',
        });
      }

      // Determine the session ID from various sources
      let sessionId: string | null = null;

      // Priority 1: Check if event has a direct session reference
      if (event.id_cible_session) {
        sessionId = event.id_cible_session;
      }
      // Priority 2: Get session from id_cible_cours
      else if (event.id_cible_cours) {
        const sessionCours = await this.sessionCoursModel.findByPk(
          event.id_cible_cours,
          {
            attributes: ['id', 'id_session'],
          },
        );
        if (sessionCours && sessionCours.id_session) {
          sessionId = sessionCours.id_session;
        }
      }
      // Priority 3: Get session from id_cible_lesson
      // All lessons in id_cible_lesson will have the same session ID
      else if (event.id_cible_lesson && event.id_cible_lesson.length > 0) {
        // Get the first lesson (all lessons share the same session)
        const lesson = await this.lessonModel.findByPk(
          event.id_cible_lesson[0],
          {
            attributes: ['id', 'id_cours'],
          },
        );

        if (lesson && lesson.id_cours) {
          // Get the session course
          const sessionCours = await this.sessionCoursModel.findByPk(
            lesson.id_cours,
            {
              attributes: ['id', 'id_session'],
            },
          );

          if (sessionCours && sessionCours.id_session) {
            sessionId = sessionCours.id_session;
          }
        }
      }

      // If no session ID could be determined, return error
      if (!sessionId) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage:
            'Event does not have an associated session. Cannot determine session from id_cible_session, id_cible_cours, or id_cible_lesson.',
        });
      }

      // Get all users in the session from UserInSession
      const usersInSession = await this.userInSessionModel.findAll({
        where: {
          id_session: sessionId,
        },
        include: [
          {
            model: Users,
            as: 'user',
            required: true,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'email',
              'phone',
              'avatar',
            ],
          },
        ],
      });

      // Get the participant list from the event (or empty array if null)
      const participants = event.participant || [];

      // Filter users who are in the session but NOT in the participants list
      const absentStudents = usersInSession
        .filter(
          (userInSession) => !participants.includes(userInSession.id_user),
        )
        .map((userInSession) => ({
          id: userInSession.user.id,
          firstName: userInSession.user.firstName,
          lastName: userInSession.user.lastName,
          email: userInSession.user.email,
          phone: userInSession.user.phone,
          avatar: userInSession.user.avatar,
          userInSessionId: userInSession.id,
          status: userInSession.status,
        }));

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          eventId: event.id,
          eventTitle: event.title,
          sessionId: sessionId,
          absentCount: absentStudents.length,
          totalInSession: usersInSession.length,
          participantsCount: participants.length,
          absentStudents: absentStudents,
        },
        customMessage: 'Absent students retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving absent students:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving absent students',
      });
    }
  }
}
