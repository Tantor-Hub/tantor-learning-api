import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  PrimaryKey,
  BelongsToMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IEvent } from 'src/interface/interface.event';
import { Training } from './model.trainings';
import { TrainingSession } from './model.trainingssession';
import { SessionCours } from './model.sessioncours';
import { Lesson } from './model.lesson';
import { Users } from './model.users';

@Table({ tableName: tables['events'], timestamps: true })
export class Event extends Model<IEvent> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.UUID))
  id_cible_training?: string[];

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => TrainingSession)
  id_cible_session?: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => SessionCours)
  id_cible_cours?: string;

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.UUID))
  id_cible_lesson?: string[];

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.UUID))
  id_cible_user?: string[];

  @AllowNull(true)
  @Column(DataType.UUID)
  @ForeignKey(() => Users)
  createdBy?: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  begining_date: Date;

  @AllowNull(false)
  @Column(DataType.STRING)
  beginning_hour: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  ending_hour: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  updatedAt: Date;

  // Relationships - Many-to-Many with Training
  @BelongsToMany(() => Training, {
    through: 'EventTraining',
    foreignKey: 'eventId',
    otherKey: 'trainingId',
  })
  trainings?: Training[];

  // Relationship - Belongs to TrainingSession
  @BelongsTo(() => TrainingSession, {
    foreignKey: 'id_cible_session',
    targetKey: 'id',
  })
  trainingSession?: TrainingSession;

  // Relationship - Belongs to SessionCours
  @BelongsTo(() => SessionCours, {
    foreignKey: 'id_cible_cours',
    targetKey: 'id',
  })
  sessionCours?: SessionCours;

  // Note: lessons relationship will be handled manually in service
  // since we store lesson IDs in id_cible_lesson array field

  // Relationships - Many-to-Many with Users
  @BelongsToMany(() => Users, {
    through: 'EventUser',
    foreignKey: 'eventId',
    otherKey: 'userId',
  })
  users?: Users[];

  // Relationship - Belongs to User (Creator)
  @BelongsTo(() => Users, {
    foreignKey: 'createdBy',
    targetKey: 'id',
  })
  creator?: Users;
}
