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
import { StudentAnswer } from './model.studentanswer';
import { EvaluationQuestionOption } from './model.evaluationquestionoption';

@Table({
  tableName: '___tbl_tantor_student_answer_options',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class StudentAnswerOption extends Model<StudentAnswerOption> {
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  studentAnswerId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  optionId: string;

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
  @BelongsTo(() => StudentAnswer, {
    foreignKey: 'studentAnswerId',
    targetKey: 'id',
  })
  studentAnswer?: StudentAnswer;

  @BelongsTo(() => EvaluationQuestionOption, {
    foreignKey: 'optionId',
    targetKey: 'id',
  })
  option?: EvaluationQuestionOption;
}
