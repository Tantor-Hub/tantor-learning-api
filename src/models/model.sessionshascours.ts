import {
  Table,
  Model,
  Column,
  DataType,
  Default,
  AllowNull,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Documents } from './model.documents';
import { Users } from './model.users';
import { SessionSuivi } from './model.suivisession';
import { ICours } from 'src/interface/interface.cours';
import { Listcours } from './model.cours';
import { Chapitre } from './model.chapitres';

@Table({ tableName: tables['sessionhascours'] })
export class Cours extends Model<ICours> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Listcours)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id_preset_cours: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  duree: number; // en minutes

  @AllowNull(true)
  @Column(DataType.FLOAT)
  ponderation: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_published: boolean;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  @ForeignKey(() => Users)
  createdBy: number;

  @BelongsTo(() => Users, 'createdBy')
  CreatedBy: Users;

  @ForeignKey(() => SessionSuivi)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id_session: number;

  @AllowNull(true)
  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  id_formateur?: number;

  @HasMany(() => Documents)
  Documents: Documents[];

  @HasMany(() => Chapitre)
  Chapitres: Chapitre[];

  @BelongsTo(() => SessionSuivi)
  Session: SessionSuivi;

  @BelongsTo(() => Listcours)
  Title: Listcours;
}
