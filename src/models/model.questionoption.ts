import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Question } from './model.question';

@Table({ tableName: tables['questionoptions'] })
export class QuestionOption extends Model {
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
  text: string;

  @Column(DataType.BOOLEAN)
  isCorrect?: boolean; // For correct answers

  @AllowNull(false)
  @Column(DataType.INTEGER)
  order: number;

  @ForeignKey(() => Question)
  @Column(DataType.UUID)
  questionId: string;

  @BelongsTo(() => Question)
  question: Question;
}
