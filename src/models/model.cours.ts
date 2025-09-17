import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IListcours } from 'src/interface/interface.cours';
import { Users } from './model.users';
@Table({ tableName: tables['cours'] })
export class Listcours extends Model<IListcours> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  @ForeignKey(() => Users)
  createdBy: number;

  @BelongsTo(() => Users, 'createdBy')
  CreatedBy: Users;
}
