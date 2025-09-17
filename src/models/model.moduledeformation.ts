import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IModuleDeFormation } from 'src/interface/interface.moduledeformation';

@Table({ tableName: tables.moduledeformation, timestamps: true })
export class ModuleDeFormation extends Model<IModuleDeFormation> {
  @PrimaryKey
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  id: string;

  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  uuid: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING, allowNull: false })
  piece_jointe: string;
}
