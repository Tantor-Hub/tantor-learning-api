import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  PrimaryKey,
  BelongsToMany,
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
  @Column(DataType.ARRAY(DataType.UUID))
  id_cible_session?: string[];

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.UUID))
  id_cible_cours?: string[];

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.UUID))
  id_cible_lesson?: string[];

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.UUID))
  id_cible_user?: string[];

  @AllowNull(false)
  @Column(DataType.DATE)
  begining_date: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  ending_date?: Date;

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

  // Relationships - Many-to-Many with TrainingSession
  @BelongsToMany(() => TrainingSession, {
    through: 'EventTrainingSession',
    foreignKey: 'eventId',
    otherKey: 'sessionId',
  })
  trainingSessions?: TrainingSession[];

  // Relationships - Many-to-Many with SessionCours
  @BelongsToMany(() => SessionCours, {
    through: 'EventSessionCours',
    foreignKey: 'eventId',
    otherKey: 'coursId',
  })
  sessionCours?: SessionCours[];

  // Relationships - Many-to-Many with Lesson
  @BelongsToMany(() => Lesson, {
    through: 'EventLesson',
    foreignKey: 'eventId',
    otherKey: 'lessonId',
  })
  lessons?: Lesson[];

  // Relationships - Many-to-Many with Users
  @BelongsToMany(() => Users, {
    through: 'EventUser',
    foreignKey: 'eventId',
    otherKey: 'userId',
  })
  users?: Users[];
}
