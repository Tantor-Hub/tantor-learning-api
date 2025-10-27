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
  QUIZ = 'quiz',
  EXAMEN = 'examen',
}

export enum MarkingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PUBLISHED = 'published',
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
  createdBy: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  studentId?: string[];

  @AllowNull(false)
  @Column(DataType.DATE)
  submittiondate: Date;

  @AllowNull(true)
  @Column(DataType.TIME)
  beginningTime?: string;

  @AllowNull(true)
  @Column(DataType.TIME)
  endingTime?: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  ispublish: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isImmediateResult: boolean;

  @Default(MarkingStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(MarkingStatus)),
    allowNull: false,
  })
  markingStatus: MarkingStatus;

  @AllowNull(false)
  @Column(DataType.UUID)
  sessionCoursId: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  lessonId?: string[];

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => Users, {
    foreignKey: 'createdBy',
    targetKey: 'id',
  })
  creator?: Users;

  @BelongsTo(() => require('./model.sessioncours').SessionCours, {
    foreignKey: 'sessionCoursId',
    targetKey: 'id',
  })
  sessionCours?: any;

  // Note: lessonId is now an array, so direct BelongsTo relationship is not possible
  // Use a custom method to fetch lessons if needed

  @HasMany(() => require('./model.evaluationquestion').EvaluationQuestion, {
    foreignKey: 'evaluationId',
    sourceKey: 'id',
  })
  questions?: any[];
}
