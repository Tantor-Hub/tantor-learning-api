import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lesson } from 'src/models/model.lesson';
import { Documents } from 'src/models/model.documents';
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
    @InjectModel(Documents)
    private documentModel: typeof Documents,
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
        { model: Documents, as: 'documents' },
        { model: Users, as: 'CreatedBy' },
      ],
    });
  }

  async findLessonById(id: number): Promise<Lesson | null> {
    return this.lessonModel.findByPk(id, {
      include: [
        { model: Documents, as: 'documents' },
        { model: Users, as: 'CreatedBy' },
      ],
    });
  }

  async updateLesson(
    id: number,
    updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson | null> {
    const lesson = await this.lessonModel.findByPk(id);
    if (lesson) {
      await lesson.update(updateLessonDto);
    }
    return lesson;
  }

  async deleteLesson(id: number): Promise<void> {
    const lesson = await this.lessonModel.findByPk(id);
    if (lesson) {
      await lesson.destroy();
    }
  }

  async addDocumentToLesson(
    createDocumentDto: CreateDocumentDto,
    user: IJwtSignin,
  ): Promise<Documents> {
    return this.documentModel.create({
      file_name: createDocumentDto.document_name,
      url: createDocumentDto.piece_jointe,
      id_lesson: createDocumentDto.id_lesson,
      id_session: createDocumentDto.id_session,
      type: createDocumentDto.type,
      createdBy: (user as any).id,
    });
  }

  async getDocumentsByLesson(idLesson: number): Promise<Documents[]> {
    return this.documentModel.findAll({
      where: { id_lesson: idLesson },
      include: [{ model: Users, as: 'CreatedBy' }],
    });
  }
}
