import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ICours } from 'src/interface/interface.cours';
import { Users } from './model.users';
import { Lesson } from './model.lesson';
@Table({ tableName: tables['cours'] })
export class Cours extends Model<ICours> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  title?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  ponderation?: number;

  @AllowNull(true)
  @Column(DataType.BOOLEAN)
  is_published?: boolean;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  @ForeignKey(() => Users)
  createdBy?: number;

  @BelongsTo(() => Users, 'createdBy')
  CreatedBy?: Users;

  @AllowNull(true)
  @Column(DataType.STRING)
  id_session?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  id_formateur?: string;

  @HasMany(() => Lesson)
  lessons: Lesson[];
}
