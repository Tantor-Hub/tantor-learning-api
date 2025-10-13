import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  BelongsTo,
  HasMany,
  ForeignKey,
  Default,
} from 'sequelize-typescript';
import { EvaluationQuestion } from './model.evaluationquestion';
import { Studentevaluation } from './model.studentevaluation';
import { Users } from './model.users';
import { StudentAnswerOption } from './model.studentansweroption';

@Table({
  tableName: '___tbl_tantor_student_answers',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class StudentAnswer extends Model<StudentAnswer> {
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  questionId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  studentId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  evaluationId: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  answerText?: string;

  @AllowNull(true)
  @Column(DataType.BOOLEAN)
  isCorrect?: boolean;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => EvaluationQuestion, {
    foreignKey: 'questionId',
    targetKey: 'id',
  })
  question?: EvaluationQuestion;

  @BelongsTo(() => Users, {
    foreignKey: 'studentId',
    targetKey: 'id',
  })
  student?: Users;

  @BelongsTo(() => Studentevaluation, {
    foreignKey: 'evaluationId',
    targetKey: 'id',
  })
  evaluation?: Studentevaluation;

  @HasMany(() => StudentAnswerOption, {
    foreignKey: 'studentAnswerId',
    sourceKey: 'id',
  })
  selectedOptions?: StudentAnswerOption[];
}
