import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { IRoles } from '../interface/interface.roles';
import { tables } from 'src/config/config.tablesname';
import { HasRoles } from './model.userhasroles';
import { Users } from './model.users';

@Table({ tableName: tables['roles'], timestamps: false })
export class Roles extends Model<IRoles> {
    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true, })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    role: string;

    @Column({ type: DataType.STRING, allowNull: true, })
    description: string;

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
    status: number

    @BelongsToMany(() => Users, () => HasRoles, {
        foreignKey: 'RoleId',
        otherKey: 'UserId'
    } as any)
    users!: Users[];
}
