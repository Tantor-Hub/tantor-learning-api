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
import { IDocument } from 'src/interface/interface.document';
import { SessionSuivi } from './model.suivisession';
import { Users } from './model.users';

@Table({ tableName: tables['documents'] })
export class Documents extends Model<IDocument> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

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
  @Column(DataType.INTEGER)
  id_lesson: number;

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  createdBy: number;

  @ForeignKey(() => SessionSuivi)
  @Column(DataType.INTEGER)
  id_session: number;

  @BelongsTo(() => Lesson)
  lesson: Lesson;
}
