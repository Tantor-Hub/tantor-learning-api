import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IPayemenMethode } from 'src/interface/interface.payementmethode';
import { Users } from './model.users';
import { SessionSuivi } from './model.suivisession';
import { StagiaireHasSession } from './model.stagiairehassession';

@Table({
    tableName: tables['payementmethode'],
    timestamps: true,
    indexes: [
        {
            name: 'unique_user_session_combo',
            unique: true,
            fields: ['id_user', 'id_session', 'id_session_student']
        }
    ]
})
export class Payement extends Model<IPayemenMethode> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    id_stripe_payment: string;

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

    @ForeignKey(() => StagiaireHasSession)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_session_student: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    full_name: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    amount: number;

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
        defaultValue: 0, // 1 paid, 0 not paid
    })
    status: number;

    @BelongsTo(() => Users)
    Stagiaire: Users;

    @BelongsTo(() => SessionSuivi)
    Formation: SessionSuivi;

    @BelongsTo(() => StagiaireHasSession)
    Session: StagiaireHasSession;
}
