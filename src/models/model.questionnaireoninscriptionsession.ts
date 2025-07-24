import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { IQuestionnaire } from 'src/interface/interface.cours';
import { QuestioninscriptionSession } from './model.questionspourquestionnaireinscription';

@Table({ tableName: 'questionnaires-lors-de-inscription-session' })
export class Questionnaires extends Model<IQuestionnaire> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  titre: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @Column({ type: DataType.ENUM('sondage'), defaultValue: 'sondage' })
  type: string;

  @HasMany(() => QuestioninscriptionSession)
  questions: QuestioninscriptionSession[];
}