import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Document } from './model.document';
import { Users } from './model.users';

@Table({ tableName: tables['documentsstudents'], timestamps: true })
export class DocumentResponse extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Document)
  @Column({ type: DataType.UUID, allowNull: false })
  documentId: string;

  @BelongsTo(() => Document, 'documentId')
  document?: Document;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => Users, 'userId')
  user?: Users;

  @Column({ type: DataType.JSONB })
  answers: Record<string, any>;

  @Column({ type: DataType.DATE, allowNull: true })
  submittedAt?: Date;
}
