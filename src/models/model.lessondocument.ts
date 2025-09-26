import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Lesson } from './model.lesson';
import { Users } from './model.users';

@Table({ tableName: tables['lessondocument'] })
export class Lessondocument extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  file_name: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  url: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  type: string; // PDF, vidéo, Word...

  @ForeignKey(() => Lesson)
  @Column(DataType.STRING)
  id_lesson: string;

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  createdBy: number;

  @BelongsTo(() => Lesson)
  lesson: Lesson;
}
