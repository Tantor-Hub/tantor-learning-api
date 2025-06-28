import { Table, Column, Model, HasMany, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Question } from './model.quiz';
import { Cours } from './model.sessionshascours';
import { IEvaluation } from 'src/interface/interface.cours';

@Table({ tableName: 'evaluations' })
export class Evaluation extends Model<IEvaluation> {
    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @Column({ type: DataType.STRING, allowNull: true })
    estimatedDuration: string;

    @Column({ type: DataType.STRING, allowNull: true })
    score: string;

    @Column({ type: DataType.BOOLEAN, allowNull: true })
    is_finished: false;

    @ForeignKey(() => Cours)
    @Column
    id_cours: number;

    @BelongsTo(() => Cours)
    Cours: Cours;

    @HasMany(() => Question)
    Questions: Question[];
}
