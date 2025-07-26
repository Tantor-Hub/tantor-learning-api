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
import { IQuestion, IQuestioninscriptionSession } from 'src/interface/interface.cours';
import { table_prefix } from 'src/config/config.tablesname';
import { Questionnaires } from './model.questionnaireoninscriptionsession';
import { SessionSuivi } from './model.suivisession';

@Table({ tableName: `${table_prefix}questions`, timestamps: true })
export class QuestioninscriptionSession extends Model<IQuestioninscriptionSession> {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id: number;

    @ForeignKey(() => SessionSuivi)
    @Column({ type: DataType.INTEGER })
    id_session: number;

    @ForeignKey(() => Questionnaires)
    @Column({ type: DataType.INTEGER })
    id_questionnaire: number;

    @BelongsTo(() => Questionnaires)
    Questionnaires: Questionnaires;

    @Column({ type: DataType.STRING, allowNull: false })
    texte: string;

    @HasMany(() => Option)
    Options: Option[];
}
