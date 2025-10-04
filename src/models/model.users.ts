import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IUsers, UserRole } from 'src/interface/interface.users';
import { Lesson } from './model.lesson';

@Table({ tableName: tables['users'], timestamps: true })
export class Users extends Model<IUsers> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: true })
  avatar?: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  phone?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  verification_code?: string;

  @Column({ type: DataType.DATE, allowNull: true })
  last_login?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_verified?: boolean;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  num_piece_identite?: string;

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

  @Column({ type: DataType.STRING, allowNull: true })
  dateBirth?: string;

  @Column({
    type: DataType.ENUM(
      'instructor',
      'student',
      'admin',
      'secretary',
      'expulled',
    ),
    allowNull: false,
    defaultValue: 'student',
  })
  role: UserRole;

  @Column({ type: DataType.STRING, allowNull: true })
  otp?: string;

  // roles table removed; rely on single user.role

  // Relationships
  @HasMany(() => Lesson, 'createdBy')
  lessons?: Lesson[];
}
