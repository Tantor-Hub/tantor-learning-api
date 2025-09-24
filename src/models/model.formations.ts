import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IFormation } from 'src/interface/interface.formations';
import { TrainingCategory } from './model.trainingcategory';
import { FormationType } from 'src/utils/utiles.typesformations';

@Table({ tableName: tables['fromations'] })
export class Formations extends Model<IFormation> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  titre: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  sous_titre: string;

  @ForeignKey(() => TrainingCategory)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  id_training: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  id_thematic: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: FormationType.EN_LIGNE,
  })
  type_formation: string;

  @Column({
    type: DataType.TEXT,
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
  prerequis: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  alternance: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 1,
  })
  status?: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    defaultValue: 900, // Default price in euros
  })
  prix: number;

  // Relationship: Many formations belong to one training category
  @BelongsTo(() => TrainingCategory, {
    foreignKey: 'id_training',
    targetKey: 'id',
  })
  trainingCategory: TrainingCategory;
}
