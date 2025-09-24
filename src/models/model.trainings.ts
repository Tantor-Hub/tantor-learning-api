import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ITraining, TrainingType } from '../interface/interface.trainings';
import { TrainingCategory } from './model.trainingcategory';

@Table({ tableName: tables['trainings'] })
export class Training extends Model<ITraining> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  subtitle: string;

  @ForeignKey(() => TrainingCategory)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  id_trainingcategory: string;

  @Column({
    type: DataType.ENUM(
      'En ligne',
      'Vision Conférence',
      'En présentiel',
      'Hybride',
    ),
    allowNull: true,
  })
  trainingtype: TrainingType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  rnc: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  requirement: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  pedagogygoals: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  prix: number;

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

  @BelongsTo(() => TrainingCategory, {
    foreignKey: 'id_trainingcategory',
    targetKey: 'id',
  })
  trainingCategory: TrainingCategory;
}
