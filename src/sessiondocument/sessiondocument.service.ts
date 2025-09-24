import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sessiondocument } from 'src/models/model.sessiondocument';
import { Users } from 'src/models/model.users';
import { CreateSessiondocumentDto } from './dto/create-sessiondocument.dto';
import { UpdateSessiondocumentDto } from './dto/update-sessiondocument.dto';

@Injectable()
export class SessiondocumentService {
  constructor(
    @InjectModel(Sessiondocument)
    private sessiondocumentModel: typeof Sessiondocument,
    @InjectModel(Users)
    private userModel: typeof Users,
  ) {}

  async findAll(): Promise<Sessiondocument[]> {
    return this.sessiondocumentModel.findAll({
      include: [
        { model: Users, as: 'CreatedBy' },
      ],
    });
  }

  async findOne(id: number): Promise<Sessiondocument | null> {
    return this.sessiondocumentModel.findByPk(id, {
      include: [
        { model: Users, as: 'CreatedBy' },
      ],
    });
  }

  async create(
    createSessiondocumentDto: CreateSessiondocumentDto,
  ): Promise<Sessiondocument> {
    return this.sessiondocumentModel.create(createSessiondocumentDto);
  }

  async update(
    id: number,
    updateSessiondocumentDto: UpdateSessiondocumentDto,
  ): Promise<Sessiondocument | null> {
    const sessiondocument = await this.sessiondocumentModel.findByPk(id);
    if (sessiondocument) {
      // Remove id from the DTO before updating to avoid conflicts
      const { id: _, ...updateData } = updateSessiondocumentDto;
      await sessiondocument.update(updateData);
      return sessiondocument;
    }
    return null;
  }

  async remove(id: number): Promise<void> {
    const sessiondocument = await this.sessiondocumentModel.findByPk(id);
    if (sessiondocument) {
      await sessiondocument.destroy();
    }
  }
}
