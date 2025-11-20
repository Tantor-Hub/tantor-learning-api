import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  BelongsTo,
  ForeignKey,
  Default,
} from 'sequelize-typescript';
import { EvaluationQuestionOption } from './model.evaluationquestionoption';
import { EvaluationQuestion } from './model.evaluationquestion';
import { Users } from './model.users';

@Table({
  tableName: '___tbl_tantor_student_answer_options',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class StudentAnswerOption extends Model<StudentAnswerOption> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  optionId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  questionId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  studentId: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isCorrect: boolean;

  @Default(1)
  @Column(DataType.INTEGER)
  points: number;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => EvaluationQuestionOption, {
    foreignKey: 'optionId',
    targetKey: 'id',
  })
  option?: EvaluationQuestionOption;

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
}
