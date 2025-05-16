import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    ForeignKey,
    Default,
} from 'sequelize-typescript';
import { StagiaireHasSession } from './model.stagiairehassession';
import { Users } from './model.users';
import { Formations } from './model.formations';
import { IHomeWorks } from 'src/interface/interface.homework';
import { tables } from 'src/config/config.tablesname';

@Table({
    tableName: tables['homeworks'], timestamps: true,
})
export class StagiaireHasHomeWork extends Model<IHomeWorks> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @ForeignKey(() => StagiaireHasSession) 
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id_session!: number;

    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id_user!: number;

    @ForeignKey(() => Formations)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    id_formation?: number;

    @AllowNull(false)
    @Column(DataType.DATE)
    date_de_creation!: Date;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    date_de_remise!: number;

    @AllowNull(true)
    @Column(DataType.STRING)
    piece_jointe?: string;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    is_returned!: number;
}