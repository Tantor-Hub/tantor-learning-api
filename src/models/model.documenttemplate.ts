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
import { DocumentInstance } from './model.documentinstance';
import { TrainingSession } from './model.trainingssession';

@Table({ tableName: tables.documenttemplate, timestamps: true })
export class DocumentTemplate extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  content: object;

  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID, allowNull: false })
  createdById: string;

  @BelongsTo(() => Users)
  createdBy: Users;

  @ForeignKey(() => TrainingSession)
  @Column({ type: DataType.UUID, allowNull: false })
  sessionId: string;

  @BelongsTo(() => TrainingSession)
  trainingSession: TrainingSession;

  @Column({
    type: DataType.ENUM('before', 'during', 'after'),
    allowNull: false,
  })
  type: 'before' | 'during' | 'after';

  @Column({ type: DataType.JSONB, allowNull: true })
  variables: object;

  @Column({ type: DataType.STRING, allowNull: true })
  imageUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  signature: boolean;

  @HasMany(() => DocumentInstance)
  instances: DocumentInstance[];

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updatedAt: Date;
}
