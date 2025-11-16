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

// Enum for book status
export enum BookStatus {
  PREMIUM = 'premium',
  FREE = 'free',
}

@Table({
  tableName: tables['books'],
  timestamps: true,
})
export class Book extends Model<Book> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  title: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  description?: string;

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: true,
    defaultValue: [],
  })
  session?: string[]; // Array of session IDs

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  author: string;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID, allowNull: false })
  createby: string;

  @Column({
    type: DataType.ENUM(...Object.values(BookStatus)),
    allowNull: false,
    defaultValue: BookStatus.FREE,
  })
  status: BookStatus;

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
    defaultValue: [],
  })
  category: string[]; // Array of BookCategory IDs

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  icon: string; // Cloudinary URL

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  piece_joint: string; // Cloudinary URL

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  views: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  download: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  downloadable: boolean;

  @BelongsTo(() => Users, { foreignKey: 'createby', targetKey: 'id' })
  creator: Users;
}
