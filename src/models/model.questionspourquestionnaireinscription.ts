import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { IQuestioninscriptionSession } from 'src/interface/interface.cours';
import { table_prefix } from 'src/config/config.tablesname';
import { Questionnaires } from './model.questionnaireoninscriptionsession';
import { SessionSuivi } from './model.suivisession';

@Table({ tableName: `${table_prefix}questionssurvey`, timestamps: true })
export class Survey extends Model<IQuestioninscriptionSession> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @ForeignKey(() => SessionSuivi)
  @Column({ type: DataType.INTEGER })
  id_session: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @HasMany(() => Questionnaires)
  Questionnaires: Questionnaires[];

  @Column({ type: DataType.INTEGER, allowNull: true })
  created_by: number;

  @BelongsTo(() => SessionSuivi, {
    onDelete: 'CASCADE',
  })
  Session: SessionSuivi;
}
