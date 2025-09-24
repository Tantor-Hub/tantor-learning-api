import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ISurveyResponse } from 'src/interface/interface.stagiairehassession';

@Table({ tableName: tables['surveyresponse'], timestamps: true })
export class SurveyResponse extends Model<ISurveyResponse> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.INTEGER })
  id_question: number;

  @Column({ type: DataType.TEXT })
  answer: string;

}
