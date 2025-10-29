import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';

@Table({ tableName: tables.uploadedfile, timestamps: true })
export class UploadedFile extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  url: string;

  @Column({ type: DataType.STRING, allowNull: false })
  publicId: string;

  @Column({ type: DataType.STRING, allowNull: true })
  originalName?: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  size?: number;

  @Column({ type: DataType.STRING, allowNull: true })
  mimeType?: string;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID, allowNull: false })
  uploadedBy: string;

  @BelongsTo(() => Users)
  user: Users;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updatedAt: Date;
}
