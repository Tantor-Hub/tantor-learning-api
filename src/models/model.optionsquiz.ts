import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Question } from './model.quiz';
import { IOption } from 'src/interface/interface.cours';
import { table_prefix } from 'src/config/config.tablesname';

@Table({ tableName: `${table_prefix}options`, timestamps: true })
export class Option extends Model<IOption> {
  @ForeignKey(() => Question)
  @Column
  id_question: number;

  @BelongsTo(() => Question)
  Question: Question;

  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_correct: boolean;
}
