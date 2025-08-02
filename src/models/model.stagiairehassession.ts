import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { IStagiaireHasSessionSuiivi } from 'src/interface/interface.stagiairehassession';
import { SessionSuivi } from './model.suivisession';
import { Payement } from './model.payementbycard';
import { SeanceSessions } from './model.courshasseances';
import { SurveyResponse } from './model.surveyresponses';

@Table({ tableName: tables['statgiairehassession'], timestamps: true })
export class StagiaireHasSession extends Model<IStagiaireHasSessionSuiivi> {

    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true, })
    id: number;

    @Column({ type: DataType.INTEGER, allowNull: true })
    id_controleur?: number;

    @Column({ type: DataType.INTEGER, allowNull: true })
    id_superviseur?: number;

    @Column({ type: DataType.DATE })
    date_mise_a_jour: Date;

    @Column({ type: DataType.INTEGER })
    id_formation: number;

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0 })
    is_started: number;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => SessionSuivi)
    id_sessionsuivi: number;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => SeanceSessions)
    id_seances: number;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => Users)
    id_stagiaire: number;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => Payement)
    id_payement: number;

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0 })
    status: number

    @BelongsTo(() => Payement)
    Payement: Payement;

    @BelongsTo(() => Users)
    Stagiaire: Users;

    @BelongsTo(() => SessionSuivi)
    Session: Users;

    @HasMany(() => SurveyResponse)
    Responses: SurveyResponse[];
}
