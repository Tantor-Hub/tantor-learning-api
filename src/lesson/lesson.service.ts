import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lesson } from 'src/models/model.lesson';
import { Users } from 'src/models/model.users';
import { SessionCours } from 'src/models/model.sessioncours';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(SessionCours)
    private sessionCoursModel: typeof SessionCours,
  ) {}

  async createLesson(
    createLessonDto: CreateLessonDto,
    user: IJwtSignin,
  ): Promise<Lesson> {
    console.log('=== createLesson: Starting ===');
    console.log('id_cours:', createLessonDto.id_cours);
    console.log('user:', user);

    // Check if the SessionCours exists
    const sessionCours = await this.sessionCoursModel.findByPk(
      createLessonDto.id_cours,
    );
    console.log('sessionCours found:', !!sessionCours);
    if (sessionCours) {
      console.log('sessionCours id:', sessionCours.id);
    }

    if (!sessionCours) {
      console.log(
        '=== createLesson: SessionCours not found, throwing error ===',
      );
      throw new BadRequestException(
        `SessionCours with id ${createLessonDto.id_cours} does not exist.`,
      );
    }

    console.log('=== createLesson: Creating lesson ===');
    const lesson = await this.lessonModel.create({
      ...createLessonDto,
      createdBy: (user as any).id,
    });
    console.log('=== createLesson: Lesson created successfully ===');
    return lesson;
  }

  async findAllLessons(): Promise<Lesson[]> {
    return this.lessonModel.findAll({
      include: [
        { model: Users, as: 'creator' },
        { model: SessionCours, as: 'sessionCours' },
      ],
    });
  }

  async findLessonById(id: string): Promise<Lesson | null> {
    return this.lessonModel.findByPk(id, {
      include: [
        { model: Users, as: 'creator' },
        { model: SessionCours, as: 'sessionCours' },
      ],
    });
  }

  async updateLesson(updateLessonDto: UpdateLessonDto): Promise<Lesson | null> {
    const { id, ...updateData } = updateLessonDto;
    const lesson = await this.lessonModel.findByPk(id);
    if (lesson) {
      await lesson.update(updateData);
    }
    return lesson;
  }

  async deleteLesson(id: string): Promise<void> {
    const lesson = await this.lessonModel.findByPk(id);
    if (lesson) {
      await lesson.destroy();
    }
  }

  async findLessonsByCoursId(id: string) {
    try {
      console.log('=== Lesson findLessonsByCoursId: Starting ===');
      console.log('Cours ID:', id);

      const lessons = await this.lessonModel.findAll({
        where: { id_cours: id },
        attributes: [
          'id',
          'title',
          'description',
          'id_cours',
          'createdAt',
          'updatedAt',
        ],
        order: [['createdAt', 'ASC']],
      });

      console.log('=== Lesson findLessonsByCoursId: Success ===');
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
      console.error('=== Lesson findLessonsByCoursId: ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving lessons by course',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
