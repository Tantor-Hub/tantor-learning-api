import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { Users } from './model.users';
import { Roles } from './model.roles';
import { IUserHasRoles } from 'src/interface/interface.userhasroles';

@Table({ tableName: '__tbl_userhasroles', timestamps: true })
export class HasRoles extends Model<IUserHasRoles> {

    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true })
    id?: number;

    @ForeignKey(() => Users)
    @Column({ allowNull: false })
    id_user: number;

    @ForeignKey(() => Roles)
    @Column({ allowNull: false })
    id_role: number;

    @ForeignKey(() => Roles)
    @Column({ allowNull: false })
    status: number;
}