import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    CreatedAt,
    UpdatedAt,
    BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { IMessages } from 'src/interface/interface.messages';

@Table({
    tableName: tables['messages'],
    timestamps: true,
})
export class Messages extends Model<IMessages> {
    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_user_sender: number;

    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_user_receiver: number;

    @BelongsTo(() => Users, 'id_user_receiver')
    Receiver: Users;

    @BelongsTo(() => Users, 'id_user_sender')
    Sender: Users;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    subject?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    date_d_envoie: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    date_de_lecture: Date;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    piece_jointe?: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    is_readed: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    is_replied_to?: number

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    thread?: string

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    status?: number // 1: alive 2: archived 3: deleted

    @Column({
        type: DataType.ARRAY(DataType.INTEGER),
        allowNull: true,
        defaultValue: []
    })
    is_deletedto?: any

    @Column({
        type: DataType.ARRAY(DataType.INTEGER),
        allowNull: true,
        defaultValue: []
    })
    is_archievedto?: any
}
