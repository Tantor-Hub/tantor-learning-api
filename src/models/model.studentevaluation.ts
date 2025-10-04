import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  BelongsTo,
  HasMany,
  ForeignKey,
} from 'sequelize-typescript';
import { Users } from './model.users';
// Forward reference to avoid circular import

export enum StudentevaluationType {
  EXERCISE = 'exercise',
  HOMEWORK = 'homework',
  TEST = 'test',
  EXAMEN = 'examen',
}

@Table({
  tableName: '___tbl_tantor_student_evaluations',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class Studentevaluation extends Model<Studentevaluation> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(StudentevaluationType)),
    defaultValue: StudentevaluationType.EXERCISE,
  })
  type: StudentevaluationType;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  points: number;

  @AllowNull(false)
  @Column(DataType.UUID)
  lecturerId: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  submittiondate: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  ispublish: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isImmediateResult: boolean;

  @AllowNull(true)
  @Column(DataType.UUID)
  sessionCoursId?: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  lessonId?: string;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => Users, {
    foreignKey: 'lecturerId',
    targetKey: 'id',
  })
  lecturer?: Users;

  @BelongsTo(() => require('./model.sessioncours').SessionCours, {
    foreignKey: 'sessionCoursId',
    targetKey: 'id',
  })
  sessionCours?: any;

  @BelongsTo(() => require('./model.lesson').Lesson, {
    foreignKey: 'lessonId',
    targetKey: 'id',
  })
  lesson?: any;

  @HasMany(() => require('./model.evaluationquestion').EvaluationQuestion, {
    foreignKey: 'evaluationId',
    sourceKey: 'id',
  })
  questions?: any[];
}
