import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { IOption } from 'src/interface/interface.optionquestionnaires';
import { table_prefix } from 'src/config/config.tablesname';

@Table({ tableName: `${table_prefix}optionsquestionnaires`, timestamps: true })
export class Options extends Model<IOption> {
  @Column
  id_question: number;

  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_correct: boolean;
}
