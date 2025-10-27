import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';

@Table({ tableName: tables['documents'], timestamps: true })
export class Document extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column(DataType.STRING)
  title: string;

  @Column(DataType.TEXT)
  description: string;

  @Column({ type: DataType.JSONB })
  content: any;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID, allowNull: false })
  createdBy: string;

  @BelongsTo(() => Users, 'createdBy')
  creator?: Users;

  @HasMany(() => require('./model.documentfield').DocumentField, 'documentId')
  fields?: any[];

  @HasMany(
    () => require('./model.documentresponse').DocumentResponse,
    'documentId',
  )
  responses?: any[];
}
