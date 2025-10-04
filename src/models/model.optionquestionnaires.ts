import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
} from 'sequelize-typescript';
import { IOption } from 'src/interface/interface.optionquestionnaires';
import { table_prefix } from 'src/config/config.tablesname';
import { Question } from './model.question';

@Table({ tableName: `${table_prefix}optionsquestionnaires`, timestamps: true })
export class Options extends Model<IOption> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Question)
  @Column({ type: DataType.UUID, allowNull: false })
  id_question: string;

  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_correct: boolean;
}
