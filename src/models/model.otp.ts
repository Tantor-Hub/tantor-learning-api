import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { IOtp } from 'src/interface/interface.otp';

@Table({
  tableName: tables['otps'],
  timestamps: true,
})
export class Otp extends Model<IOtp> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  otp: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  connected: boolean;

  @BelongsTo(() => Users, { foreignKey: 'userId', targetKey: 'id' })
  user: Users;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
