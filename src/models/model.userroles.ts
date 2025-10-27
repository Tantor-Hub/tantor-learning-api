import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';

@Table({ 
  tableName: tables['user_roles'] || '___tbl_tantor_user_roles', 
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'role']
    }
  ]
})
export class UserRoles extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id: string;

  @Column({
    type: DataType.ENUM(
      'instructor',
      'student',
      'admin',
      'secretary',
      'expulled',
    ),
    allowNull: false,
  })
  role: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_active: boolean;

  // Relationships
  @BelongsTo(() => Users)
  user: Users;
}
