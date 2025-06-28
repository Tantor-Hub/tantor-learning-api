import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IPayemenMethode } from 'src/interface/interface.payementmethode';
import { Users } from './model.users';
import { SessionSuivi } from './model.suivisession';

@Table({ tableName: tables['payementmethode'], timestamps: true, })
export class Payment extends Model<IPayemenMethode> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_user: number;

    @ForeignKey(() => SessionSuivi)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_session: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    full_name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    card_number: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    month: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    year: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    cvv: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1, // 1 paid, 0 not paid
    })
    status: number;

    @BelongsTo(() => Users)
    Stagiaire: Users;

    @BelongsTo(() => SessionSuivi)
    Session: SessionSuivi;
}
