import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    ForeignKey,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IPayemenMethode } from 'src/interface/interface.payementmethode';
import { Users } from './model.users';

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
    cvc: string;
}
