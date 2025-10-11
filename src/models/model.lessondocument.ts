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
  piece_jointe: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  type: string; // PDF, vidéo, Word...

  @AllowNull(true)
  @Column({ type: DataType.STRING, defaultValue: 'Untitled Document' })
  title: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT, defaultValue: 'No description provided' })
  description: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  ispublish: boolean;

  @ForeignKey(() => Lesson)
  @Column(DataType.UUID)
  id_lesson: string;

  @ForeignKey(() => Users)
  @Column(DataType.UUID)
  createdBy: string;

  @BelongsTo(() => Lesson, { foreignKey: 'id_lesson', targetKey: 'id' })
  lesson: Lesson;

  @BelongsTo(() => Users, { foreignKey: 'createdBy', targetKey: 'id' })
  creator: Users;
}
