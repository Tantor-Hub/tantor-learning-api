import { Table, Column, Model, DataType, BelongsToMany, HasMany } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IUsers } from 'src/interface/interface.users';
import { HasRoles } from './model.userhasroles';
import { Roles } from './model.roles';

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

    @Column({ type: DataType.STRING, allowNull: true, unique: true })
    phone?: string;

    @Column({ type: DataType.STRING, allowNull: false })
    password: string;

    @Column({ type: DataType.STRING, allowNull: true })
    verification_code: string;

    @Column({ type: DataType.DATE, allowNull: true })
    last_login: string;

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0 })
    is_verified: number

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
    status: number

    @Column({ type: DataType.STRING, allowNull: true, unique: true })
    num_record: string

    @Column({ type: DataType.STRING, allowNull: true })
    avatar?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    adresse_physique?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    pays_residance?: string;

    @Column({ type: DataType.STRING, allowNull: true, unique: true })
    num_piece_identite?: string;

    @HasMany(() => HasRoles)
    hasRoles: HasRoles[];

    @BelongsToMany(() => Roles, () => HasRoles)
    roles: Roles[];

    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    can_update_password?: number
}