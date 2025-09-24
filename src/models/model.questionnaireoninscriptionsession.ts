import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { IQuestionnaire } from 'src/interface/interface.cours';
import { QuestionType } from 'src/utils/utiles.typesprestation';
import { Options } from './model.optionquestionnaires';
import { Survey } from './model.questionspourquestionnaireinscription';
import { table_prefix } from 'src/config/config.tablesname';
import { Session } from './model.session';

@Table({
  tableName: `${table_prefix}questionnairesinscription`,
  timestamps: true,
})
export class Questionnaires extends Model<IQuestionnaire> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  titre: string;

  @Column({ type: DataType.BOOLEAN, allowNull: true })
  is_required: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @Column({ type: DataType.ENUM(...Object.values(QuestionType)) })
  type: QuestionType;

  @HasMany(() => Options)
  Options: Options[];

  @ForeignKey(() => Survey)
  @Column({ type: DataType.INTEGER, allowNull: true })
  id_questionnaire: number;

  @BelongsTo(() => Survey, {
    onDelete: 'CASCADE',
  })
  Survey: Survey;

  @ForeignKey(() => Session)
  @Column({ type: DataType.INTEGER, allowNull: true })
  id_session: number;
}
