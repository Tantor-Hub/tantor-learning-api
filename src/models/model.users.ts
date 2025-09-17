import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IUsers } from 'src/interface/interface.users';
import { HasRoles } from './model.userhasroles';
import { Roles } from './model.roles';

@Table({ tableName: tables['users'], timestamps: true })
export class Users extends Model<IUsers> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    defaultValue: DataType.UUIDV4,
  })
  uuid: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  num_record: string;

  @Column({ type: DataType.STRING, allowNull: true })
  avatar?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  fs_name?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  ls_name?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  nick_name?: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  phone?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  password?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  verification_code?: string;

  @Column({ type: DataType.DATE, allowNull: true })
  last_login?: string;

  @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0 })
  is_verified?: number;

  @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
  status?: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  can_update_password?: number;

  @Column({ type: DataType.STRING, allowNull: true })
  adresse_physique?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  pays_residance?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  ville_residance?: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  num_piece_identite?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  date_of_birth?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  firstName?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  lastName?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  address?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  country?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  city?: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  identityNumber?: number;

  @Column({ type: DataType.STRING, allowNull: true })
  dateBirth?: string;

  @Column({
    type: DataType.ENUM('instructor', 'student', 'admin', 'secretary'),
    allowNull: false,
    defaultValue: 'student',
  })
  role: 'instructor' | 'student' | 'admin' | 'secretary';

  @Column({ type: DataType.STRING, allowNull: true })
  otp?: string;

  @Column({ type: DataType.DATE, allowNull: true })
  otpExpires?: Date;

  @HasMany(() => HasRoles)
  hasRoles: HasRoles[];

  @BelongsToMany(() => Roles, () => HasRoles, {
    foreignKey: 'UserId',
    otherKey: 'RoleId',
  } as any)
  roles!: Roles[];
}
