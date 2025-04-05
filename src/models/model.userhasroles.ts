import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { Users } from './model.users';
import { Roles } from './model.roles';
import { IUserHasRoles } from 'src/interface/interface.userhasroles';
import { tables } from 'src/config/config.tablesname';

@Table({ tableName: tables['hasroles'], timestamps: true })
export class HasRoles extends Model<IUserHasRoles> {

    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true })
    id?: number;

    @ForeignKey(() => Users)
    @Column({ allowNull: false })
    UserId: number;

    @ForeignKey(() => Roles)
    @Column({ allowNull: false })
    RoleId: number;

    @Column({ allowNull: false })
    status?: number;
}