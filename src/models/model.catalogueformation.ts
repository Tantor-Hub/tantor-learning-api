import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  Unique,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import {
  ICatalogueFormation,
  CatalogueType,
} from 'src/interface/interface.catalogueformation';
import { Users } from './model.users';

@Table({
  tableName: tables['catalogueformation'],
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['type'],
      name: 'unique_catalogue_type',
    },
  ],
})
export class CatalogueFormation extends Model<ICatalogueFormation> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Unique('unique_catalogue_type')
  @Column({
    type: DataType.ENUM('user', 'student', 'instructor', 'secretary', 'admin'),
    allowNull: false,
  })
  type: CatalogueType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  piece_jointe?: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  createdBy: string;

  @BelongsTo(() => Users, {
    foreignKey: 'createdBy',
    targetKey: 'id',
  })
  creator: Users;
}
