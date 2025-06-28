import { Table, Column, Model, HasMany, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Question } from './model.quiz';
import { Cours } from './model.sessionshascours';

@Table({ tableName: 'evaluations' })
export class Evaluation extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @Column({ type: DataType.STRING, allowNull: true })
    estimatedDuration: string;

    @Column({ type: DataType.STRING, allowNull: true })
    score: string;

    @ForeignKey(() => Cours)
    @Column
    id_cours: number;

    @BelongsTo(() => Cours)
    Cours: Cours;

    @HasMany(() => Question)
    Questions: Question[];
}
