import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
    DataType,
} from 'sequelize-typescript';
import { Question } from './model.quiz';
import { IOption } from 'src/interface/interface.cours';

@Table({ tableName: 'options' })
export class Option extends Model<IOption> {
    @ForeignKey(() => Question)
    @Column
    id_question: number;

    @BelongsTo(() => Question)
    Question: Question;

    @Column({ type: DataType.STRING, allowNull: false })
    text: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    is_correct: boolean;
}
