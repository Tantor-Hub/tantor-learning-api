import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  HasMany,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ITrainingCategory } from 'src/interface/interface.trainingcategory';
import { Formations } from './model.formations';

@Table({ tableName: tables['trainingcategory'], timestamps: false })
export class TrainingCategory extends Model<ITrainingCategory> {
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
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  // Relationship: One training category can have many formations
  @HasMany(() => Formations, { foreignKey: 'id_training', sourceKey: 'id' })
  formations: Formations[];
}
