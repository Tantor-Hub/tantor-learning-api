import { Table, Column, Model, HasMany, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Question } from './model.quiz';
import { Cours } from './model.sessionshascours';
import { IEvaluation } from 'src/interface/interface.cours';
import { table_prefix } from 'src/config/config.tablesname';
import { SessionSuivi } from './model.suivisession';

@Table({ tableName: `${table_prefix}evaluations`, timestamps: true,  })
export class Evaluation extends Model<IEvaluation> {
    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @Column({ type: DataType.FLOAT, allowNull: true, defaultValue: 0 })
    estimatedDuration: number;

    @Column({ type: DataType.FLOAT, allowNull: true })
    score: number;

    @Column({ type: DataType.BOOLEAN, allowNull: true })
    is_finished: false;

    @ForeignKey(() => Cours)
    @Column
    id_cours: number;

    @ForeignKey(() => SessionSuivi)
    @Column
    id_session: number;

    @BelongsTo(() => Cours)
    Cours: Cours;

    @BelongsTo(() => SessionSuivi)
    Session: SessionSuivi;

    @HasMany(() => Question)
    Questions: Question[];
}
