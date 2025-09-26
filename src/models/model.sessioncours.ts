import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  HasMany,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ISessionCours } from 'src/interface/interface.sessioncours';
import { Users } from './model.users';
import { Lesson } from './model.lesson';
import { TrainingSession } from './model.trainingssession';

@Table({ tableName: tables['sessioncours'], timestamps: true })
export class SessionCours extends Model<ISessionCours> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  id: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  title?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(true)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_published?: boolean;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => Users)
  createdBy?: string;

  @BelongsTo(() => Users, { foreignKey: 'createdBy', targetKey: 'uuid' })
  CreatedBy?: Users;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => TrainingSession)
  id_session?: string;

  @BelongsTo(() => TrainingSession, {
    foreignKey: 'id_session',
    targetKey: 'id',
  })
  trainingSession?: TrainingSession;

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.STRING))
  id_formateur?: string[];

  @HasMany(() => Lesson, {
    foreignKey: 'id_cours',
    sourceKey: 'id',
  })
  lessons: Lesson[];
}
