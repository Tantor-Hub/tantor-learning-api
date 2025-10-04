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
import { v4 as uuidv4 } from 'uuid';

// Enum for chat status
export enum ChatStatus {
  ALIVE = 'alive',
  ARCHIVE = 'archive',
  DELETED = 'deleted',
}

@Table({
  tableName: tables['chats'],
  timestamps: true,
})
export class Chat extends Model<Chat> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID, allowNull: false })
  id_user_sender: string;

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
    defaultValue: [],
  })
  id_user_receiver: string[];

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  subject?: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  content?: string;

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: true,
    defaultValue: [],
  })
  reader?: string[];

  @Column({
    type: DataType.ENUM(...Object.values(ChatStatus)),
    allowNull: false,
    defaultValue: ChatStatus.ALIVE,
  })
  status: ChatStatus;

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: true,
    defaultValue: [],
  })
  dontshowme?: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  piece_joint?: string[];

  @BelongsTo(() => Users, { foreignKey: 'id_user_sender', targetKey: 'id' })
  sender: Users;
}
