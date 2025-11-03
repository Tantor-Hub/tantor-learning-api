import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { DocumentTemplate } from './model.documenttemplate';
import { Users } from './model.users';

@Table({ tableName: tables.documentinstance, timestamps: true })
export class DocumentInstance extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => DocumentTemplate)
  @Column({ type: DataType.UUID, allowNull: false })
  templateId: string;

  @BelongsTo(() => DocumentTemplate)
  template: DocumentTemplate;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => Users)
  user: Users;

  @Column({ type: DataType.JSONB, allowNull: false })
  filledContent: object;

  @Column({ type: DataType.JSONB, allowNull: true })
  variableValues: object;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updatedAt: Date;
}
