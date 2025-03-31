import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { IUsers } from 'src/interface/interface.users';

@Table({ tableName: '__tbl_users', timestamps: true })
export class Users extends Model<IUsers> {

    @Column({ type: DataType.STRING, allowNull: false, unique: true, autoIncrement: true })
    id: string;

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

    @Column({ type: DataType.STRING, allowNull: false })
    verification_code: string;

}