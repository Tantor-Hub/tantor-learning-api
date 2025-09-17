import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { Categories } from './model.categoriesformations';
import { tables } from 'src/config/config.tablesname';
import { IFormation } from 'src/interface/interface.formations';
import { Thematiques } from './model.groupeformations';
import { SessionSuivi } from './model.suivisession';

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

  @ForeignKey(() => Categories)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id_category: number;

  @BelongsTo(() => Categories, 'id_category')
  Category: Categories;

  @ForeignKey(() => Thematiques)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  id_thematic: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'onLine',
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

  @HasMany(() => SessionSuivi, 'id_formation')
  Sessions: SessionSuivi[];

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
}
