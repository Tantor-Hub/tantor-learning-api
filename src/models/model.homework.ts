import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IHomeworksSessions } from 'src/interface/interface.homeworks';

@Table({
    tableName: tables['homeworkssessions'],
    timestamps: true,
})
export class HomeworksSession extends Model<IHomeworksSessions> {

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_session: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    score: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    })
    total_score: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        get() {
            const value = this.getDataValue('homework_date_on');
            return value ? Number(value) : null;
        }
    })
    homework_date_on: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    id_formation?: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    piece_jointe?: string;
}
