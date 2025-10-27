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

export enum DocumentFieldType {
  text = 'text',
  textarea = 'textarea',
  date = 'date',
  number = 'number',
  signature = 'signature',
  title = 'title',
  image = 'image',
}

@Table({ tableName: tables['documentfields'], timestamps: true })
export class DocumentField extends Model {
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

  @Column(DataType.STRING)
  label: string;

  @Column({ type: DataType.ENUM(...Object.values(DocumentFieldType)) })
  type: DocumentFieldType;

  @Column({ type: DataType.INTEGER })
  x: number;

  @Column({ type: DataType.INTEGER })
  y: number;

  @Column({ type: DataType.INTEGER })
  width: number;

  @Column({ type: DataType.INTEGER })
  height: number;

  @Column({ type: DataType.INTEGER })
  orderIndex: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  required: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  placeholder?: string;

  // Optional presentation properties for title/text-like fields
  @Column({ type: DataType.INTEGER, allowNull: true })
  fontSize?: number;

  @Column({ type: DataType.STRING, allowNull: true })
  fontWeight?: string; // e.g., 'normal', 'bold', '600'

  @Column({ type: DataType.STRING, allowNull: true })
  textAlign?: string; // 'left' | 'center' | 'right'

  // Optional image source for image/signature fields
  @Column({ type: DataType.STRING, allowNull: true })
  imageUrl?: string;
}
