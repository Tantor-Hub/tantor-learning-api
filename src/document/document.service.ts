import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Documents } from 'src/models/model.documents';
import { Users } from 'src/models/model.users';
import { Lesson } from 'src/models/model.lesson';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Documents)
    private documentModel: typeof Documents,
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
  ) {}

  async findAll(): Promise<Documents[]> {
    return this.documentModel.findAll({
      include: [
        { model: Users, as: 'CreatedBy' },
        { model: Lesson, as: 'lesson' },
      ],
    });
  }

  async findOne(id: number): Promise<Documents | null> {
    return this.documentModel.findByPk(id, {
      include: [
        { model: Users, as: 'CreatedBy' },
        { model: Lesson, as: 'lesson' },
      ],
    });
  }

  async create(createDocumentDto: any): Promise<Documents> {
    return this.documentModel.create(createDocumentDto);
  }

  async update(id: number, updateDocumentDto: any): Promise<Documents | null> {
    const document = await this.documentModel.findByPk(id);
    if (document) {
      await document.update(updateDocumentDto);
      return document;
    }
    return null;
  }

  async remove(id: number): Promise<void> {
    const document = await this.documentModel.findByPk(id);
    if (document) {
      await document.destroy();
    }
  }
}
