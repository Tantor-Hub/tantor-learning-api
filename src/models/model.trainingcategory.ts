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
}
