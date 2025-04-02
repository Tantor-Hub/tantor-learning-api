import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IUsers } from 'src/interface/interface.users';

@Table({ tableName: tables['users'], timestamps: true, })
export class Users extends Model<IUsers> {

    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true })
    id: string;

    @Column({ type: DataType.UUID, allowNull: false, unique: true })
    uuid: string;

    @Column({ type: DataType.STRING, allowNull: false })
    fs_name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    ls_name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    nick_name: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    phone: string;

    @Column({ type: DataType.STRING, allowNull: false })
    password: string;

    @Column({ type: DataType.STRING, allowNull: true })
    verification_code: string;

    @Column({ type: DataType.DATE, allowNull: true })
    last_login: string;

}