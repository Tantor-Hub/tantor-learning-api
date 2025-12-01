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
import { EvaluationQuestion } from './model.evaluationquestion';
import { StudentAnswerOption } from './model.studentansweroption';

@Table({
  tableName: '___tbl_tantor_evaluation_question_options',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class EvaluationQuestionOption extends Model<EvaluationQuestionOption> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @ForeignKey(() => EvaluationQuestion)
  @Column(DataType.UUID)
  questionId: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  text: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isCorrect: boolean;

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

  @HasMany(() => StudentAnswerOption, {
    foreignKey: 'optionId',
    sourceKey: 'id',
  })
  studentAnswerOptions?: StudentAnswerOption[];
}
