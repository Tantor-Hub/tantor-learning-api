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
import { IListlesson } from 'src/interface/interface.lesson';
import { Listcours } from './model.cours';
import { Documents } from './model.documents';

@Table({ tableName: tables['lesson'] })
export class Lesson extends Model<IListlesson> {
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
  title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @ForeignKey(() => Listcours)
  @Column(DataType.INTEGER)
  id_cours: number;

  @BelongsTo(() => Listcours, 'id_cours')
  cours: Listcours;

  @HasMany(() => Documents)
  documents: Documents[];
}
