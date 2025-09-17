import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { IOption } from 'src/interface/interface.cours';
import { table_prefix } from 'src/config/config.tablesname';
import { Questionnaires } from './model.questionnaireoninscriptionsession';

@Table({ tableName: `${table_prefix}optionsquestionnaires`, timestamps: true })
export class Options extends Model<IOption> {
  @ForeignKey(() => Questionnaires)
  @Column
  id_question: number;

  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_correct: boolean;
}
