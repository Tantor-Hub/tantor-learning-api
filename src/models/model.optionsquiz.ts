import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
    DataType,
} from 'sequelize-typescript';
import { Question } from './model.quiz';

@Table({ tableName: 'options' })
export class Option extends Model {
    @ForeignKey(() => Question)
    @Column
    questionId: number;

    @BelongsTo(() => Question)
    question: Question;

    @Column({ type: DataType.STRING, allowNull: false })
    text: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isCorrect: boolean;
}
