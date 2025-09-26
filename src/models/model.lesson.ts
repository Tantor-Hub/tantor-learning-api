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
import { SessionCours } from './model.sessioncours';

@Table({ tableName: tables['lesson'] })
export class Lesson extends Model<IListlesson> {
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
  title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @ForeignKey(() => SessionCours)
  @Column(DataType.UUID)
  id_cours: string;

  @BelongsTo(() => SessionCours, 'id_cours')
  sessionCours: SessionCours;
}
