import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ISeanceSession } from 'src/interface/interface.seancesession';
import { tables } from 'src/config/config.tablesname';
import { SessionSuivi } from './model.suivisession';
import { Formations } from './model.formations';
import { Cours } from './model.sessionshascours';

@Table({
  tableName: tables['seancesessions'],
  timestamps: true,
})
export class SeanceSessions extends Model<ISeanceSession> {
  @ForeignKey(() => SessionSuivi)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id_session: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  duree: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('seance_date_on');
      return rawValue ? Number(rawValue) : null;
    }
  })
  seance_date_on: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  type_seance?: string;

  @ForeignKey(() => Formations)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  id_formation?: number;

  @ForeignKey(() => Cours)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  id_cours?: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  piece_jointe?: string;
}
