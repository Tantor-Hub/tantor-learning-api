import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Evaluation } from './model.evaluation';
import { Option } from './model.optionsquiz';
import { IQuestion } from 'src/interface/interface.cours';
import { table_prefix } from 'src/config/config.tablesname';

@Table({ tableName: `${table_prefix}questions`, timestamps: true })
export class Question extends Model<IQuestion> {
  @ForeignKey(() => Evaluation)
  @Column
  id_evaluation: number;

  @BelongsTo(() => Evaluation)
  Evaluation: Evaluation;

  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'QCM' })
  type: string;

  @HasMany(() => Option)
  Options: Option[];
}
