import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { IQuestionnaire } from 'src/interface/interface.cours';
import { QuestionType } from 'src/utils/utiles.typesprestation';
import { Options } from './model.optionquestionnaires';

@Table({ tableName: 'questionnaires-lors-de-inscription-session' })
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
}