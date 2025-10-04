import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { Chat } from './model.chat';
import { v4 as uuidv4 } from 'uuid';

// Enum for replies chat status
export enum RepliesChatStatus {
  ALIVE = 'alive',
  ARCHIVE = 'archive',
  DELETED = 'deleted',
}

@Table({
  tableName: tables['replieschats'],
  timestamps: true,
})
export class RepliesChat extends Model<RepliesChat> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  content: string;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID, allowNull: false })
  id_sender: string;

  @ForeignKey(() => Chat)
  @Column({ type: DataType.UUID, allowNull: false })
  id_chat: string;

  @Column({
    type: DataType.ENUM(...Object.values(RepliesChatStatus)),
    allowNull: false,
    defaultValue: RepliesChatStatus.ALIVE,
  })
  status: RepliesChatStatus;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_public: boolean;

  @BelongsTo(() => Users, { foreignKey: 'id_sender', targetKey: 'id' })
  sender: Users;

  @BelongsTo(() => Chat, { foreignKey: 'id_chat' })
  chat: Chat;
}
