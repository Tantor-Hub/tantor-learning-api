import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { Chat } from './model.chat';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: tables['transferechats'],
  timestamps: true,
})
export class TransferChat extends Model<TransferChat> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => Chat)
  @Column({ type: DataType.UUID, allowNull: false })
  id_chat: string;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID, allowNull: false })
  sender: string;

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
    defaultValue: [],
  })
  receivers: string[];

  @BelongsTo(() => Chat, { foreignKey: 'id_chat', targetKey: 'id' })
  chat: Chat;

  @BelongsTo(() => Users, { foreignKey: 'sender', targetKey: 'id' })
  senderUser: Users;
}

