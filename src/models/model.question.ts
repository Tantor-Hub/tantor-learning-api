import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { SurveyQuestion } from './model.surveyquestion';
import { QuestionOption } from './model.questionoption';

@Table({ tableName: tables['questions'] })
export class Question extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  question: string;

  @AllowNull(false)
  @Column(DataType.ENUM('multiple_choice', 'text', 'rating', 'yes_no'))
  type: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  required: boolean;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  order: number;

  @Column(DataType.INTEGER)
  maxSelections?: number; // For multiple choice questions

  @ForeignKey(() => SurveyQuestion)
  @Column(DataType.UUID)
  surveyQuestionId: string;

  @BelongsTo(() => SurveyQuestion)
  surveyQuestion: SurveyQuestion;

  @HasMany(() => QuestionOption)
  options: QuestionOption[];
}
