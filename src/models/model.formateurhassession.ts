import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { Users } from './model.users';
import { Roles } from './model.roles';
import { tables } from 'src/config/config.tablesname';
import { IFormateurHasSession } from 'src/interface/interface.formateurhassession';
import { SessionSuivi } from './model.suivisession';

@Table({ tableName: tables['formateurhassession'], timestamps: true })
export class FormateurHasSession extends Model<IFormateurHasSession> {

    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true })
    id?: number;

    @ForeignKey(() => Users)
    @Column({ allowNull: false, type: DataType.INTEGER })
    UserId: number;

    @ForeignKey(() => SessionSuivi)
    @Column({ allowNull: false, type: DataType.INTEGER })
    SessionId: number;

    @Column({ allowNull: false, type: DataType.INTEGER })
    status?: number;

    @Column({ allowNull: false, type: DataType.TEXT })
    description?: string;

    @Column({ allowNull: false, type: DataType.INTEGER })
    is_complited?: number;
}