import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ITrainingSession } from 'src/interface/interface.trainingssession';
import { Training } from './model.trainings';

@Table({ tableName: tables['trainingssession'], timestamps: true })
export class TrainingSession extends Model<ITrainingSession> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Training)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_trainings: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  nb_places: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  available_places: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  required_document_before?: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  required_document_during?: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  required_document_after?: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  payment_method?: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  survey?: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  regulation_text: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  begining_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  ending_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  updatedAt: Date;

  // Relationship: Many training sessions belong to one training
  @BelongsTo(() => Training, {
    foreignKey: 'id_trainings',
    targetKey: 'id',
  })
  trainings: Training;
}
