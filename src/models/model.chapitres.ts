import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Cours } from './model.sessionshascours';
import { IChapitres } from 'src/interface/interface.cours';

@Table({ tableName: 'chapitres', timestamps: false })
export class Chapitre extends Model<IChapitres> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  chapitre: string;

  @AllowNull(false)
  @Column
  @ForeignKey(() => Cours)
  id_cours: number;

  @BelongsTo(() => Cours)
  Cours: Cours;

  @AllowNull(false)
  @Column(DataType.ARRAY(DataType.STRING)) // PostgreSQL uniquement
  paragraphes: string[];
}
