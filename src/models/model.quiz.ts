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


@Table({ tableName: 'questions' })
export class Question extends Model {
    @ForeignKey(() => Evaluation)
    @Column
    evaluationId: number;

    @BelongsTo(() => Evaluation)
    evaluation: Evaluation;

    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;

    @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'QCM' })
    type: string; // tu peux mettre d'autres types si tu veux à l'avenir

    @HasMany(() => Option)
    options: Option[];
}
