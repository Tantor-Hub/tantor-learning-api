import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    AllowNull,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { IPlanings } from 'src/interface/interface.planing';

@Table({ tableName: tables['planing'], timestamps: true })
export class Planings extends Model<IPlanings> {
    @AllowNull(false)
    @Column({
        type: DataType.STRING,
    })
    titre: string;

    @AllowNull(false)
    @Column({
        type: DataType.TEXT,
    })
    description: string;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM('Examen', 'Cours', 'Réunion', 'Autre'),
    })
    type: 'Examen' | 'Cours' | 'Réunion' | 'Autre';

    @ForeignKey(() => Users)
    @AllowNull(true)
    @Column({
        type: DataType.INTEGER,
    })
    id_cibling?: number | null;

    @BelongsTo(() => Users, 'id_cibling')
    cibling?: Users;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    createdBy: number

    @AllowNull(true)
    @Column({
        type: DataType.ARRAY(DataType.BIGINT),
        defaultValue: [],
    })
    timeline: number[];

    @AllowNull(true)
    @Column({ type: DataType.INTEGER, defaultValue: 1 })
    status: number
}