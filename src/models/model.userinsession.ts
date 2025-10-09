import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  Default,
  Unique,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IUserInSession } from 'src/interface/interface.userinsession';
import { UserInSessionStatus } from 'src/enums/user-in-session-status.enum';
import { TrainingSession } from './model.trainingssession';
import { Users } from './model.users';

@Table({
  tableName: tables['userinsession'],
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id_user', 'id_session'],
    },
  ],
})
export class UserInSession extends Model<IUserInSession> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => TrainingSession)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_session: string;

  @Column({
    type: DataType.ENUM('refusedpayment', 'notpaid', 'pending', 'in', 'out'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: UserInSessionStatus;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_user: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => TrainingSession, {
    foreignKey: 'id_session',
    targetKey: 'id',
  })
  trainingSession: TrainingSession;

  @BelongsTo(() => Users, {
    foreignKey: 'id_user',
    targetKey: 'id',
  })
  user: Users;
}
