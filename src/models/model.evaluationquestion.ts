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
import { Studentevaluation } from './model.studentevaluation';
import { EvaluationQuestionOption } from './model.evaluationquestionoption';
import { StudentAnswer } from './model.studentanswer';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT = 'text',
}

@Table({
  tableName: '___tbl_tantor_evaluation_questions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class EvaluationQuestion extends Model<EvaluationQuestion> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  evaluationId: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(QuestionType)))
  type: QuestionType;

  @AllowNull(true)
  @Column(DataType.TEXT)
  text?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isImmediateResult: boolean;

  @Default(1)
  @Column(DataType.INTEGER)
  points: number;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => Studentevaluation, {
    foreignKey: 'evaluationId',
    targetKey: 'id',
  })
  evaluation?: Studentevaluation;

  @HasMany(() => EvaluationQuestionOption, {
    foreignKey: 'questionId',
    sourceKey: 'id',
  })
  options?: EvaluationQuestionOption[];

  @HasMany(() => StudentAnswer, {
    foreignKey: 'questionId',
    sourceKey: 'id',
  })
  studentAnswers?: StudentAnswer[];
}
