import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lesson } from 'src/models/model.lesson';
import { Users } from 'src/models/model.users';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
    @InjectModel(Users)
    private userModel: typeof Users,
  ) {}

  async createLesson(
    createLessonDto: CreateLessonDto,
    user: IJwtSignin,
  ): Promise<Lesson> {
    return this.lessonModel.create({
      ...createLessonDto,
      createdBy: (user as any).id,
    });
  }

  async findAllLessons(): Promise<Lesson[]> {
    return this.lessonModel.findAll({
      include: [
        { model: Users, as: 'CreatedBy' },
      ],
    });
  }

  async findLessonById(id: string): Promise<Lesson | null> {
    return this.lessonModel.findByPk(id, {
      include: [
        { model: Users, as: 'CreatedBy' },
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

}
