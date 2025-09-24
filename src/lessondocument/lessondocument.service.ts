import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lessondocument } from 'src/models/model.lessondocument';
import { Users } from 'src/models/model.users';
import { Lesson } from 'src/models/model.lesson';
import { CreateLessondocumentDto } from './dto/create-lessondocument.dto';
import { UpdateLessondocumentDto } from './dto/update-lessondocument.dto';

@Injectable()
export class LessondocumentService {
  constructor(
    @InjectModel(Lessondocument)
    private lessondocumentModel: typeof Lessondocument,
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
  ) {}

  async findAll(): Promise<Lessondocument[]> {
    return this.lessondocumentModel.findAll({
      include: [
        { model: Users, as: 'CreatedBy' },
        { model: Lesson, as: 'lesson' },
      ],
    });
  }

  async findOne(id: number): Promise<Lessondocument | null> {
    return this.lessondocumentModel.findByPk(id, {
      include: [
        { model: Users, as: 'CreatedBy' },
        { model: Lesson, as: 'lesson' },
      ],
    });
  }

  async create(
    createLessondocumentDto: CreateLessondocumentDto,
  ): Promise<Lessondocument> {
    return this.lessondocumentModel.create(createLessondocumentDto as any);
  }

  async update(
    id: number,
    updateLessondocumentDto: UpdateLessondocumentDto,
  ): Promise<Lessondocument | null> {
    const lessondocument = await this.lessondocumentModel.findByPk(id);
    if (lessondocument) {
      await lessondocument.update(updateLessondocumentDto);
      return lessondocument;
    }
    return null;
  }

  async remove(id: number): Promise<void> {
    const lessondocument = await this.lessondocumentModel.findByPk(id);
    if (lessondocument) {
      await lessondocument.destroy();
    }
  }
}
