import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ISurveyQuestion } from 'src/interface/interface.surveyquestion';
import { TrainingSession } from './model.trainingssession';
import { Users } from './model.users';
import { SurveyCategories } from 'src/enums/survey-categories.enum';
import { SurveyQuestionData } from 'src/interface/interface.question';

@Table({ tableName: tables['surveyquestions'] })
export class SurveyQuestion extends Model<ISurveyQuestion> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @ForeignKey(() => TrainingSession)
  @Column(DataType.UUID)
  id_session: string;

  @AllowNull(false)
  @Column(DataType.JSONB)
  questions: SurveyQuestionData[];

  @AllowNull(false)
  @Column(DataType.ENUM('before', 'during', 'after'))
  categories: 'before' | 'during' | 'after';

  @ForeignKey(() => Users)
  @Column(DataType.UUID)
  createdBy: string;

  @BelongsTo(() => TrainingSession, 'id_session')
  trainingSession: TrainingSession;

  @BelongsTo(() => Users, { foreignKey: 'createdBy', targetKey: 'uuid' })
  creator: Users;
}
