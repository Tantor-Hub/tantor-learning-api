import { Table, Column, Model, HasMany, DataType } from 'sequelize-typescript';
import { Question } from './model.quiz';

@Table({ tableName: 'evaluations' })
export class Evaluation extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @Column({ type: DataType.STRING, allowNull: true })
    estimatedDuration: string;

    @HasMany(() => Question)
    questions: Question[];
}
