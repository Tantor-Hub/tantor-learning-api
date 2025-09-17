import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { IPayementopco } from 'src/interface/interface.payementmethode';
import { SessionSuivi } from './model.suivisession';
import { StagiaireHasSession } from './model.stagiairehassession';

@Table({ tableName: tables['opcopayement'], timestamps: true })
export class Payementopco extends Model<IPayementopco> {
  @Column({ type: DataType.STRING, allowNull: false })
  nom_opco?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  nom_entreprise?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  siren?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  nom_responsable?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  telephone_responsable: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email_responsable: string;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_user: number;

  @ForeignKey(() => SessionSuivi)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_session: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => StagiaireHasSession)
  id_session_student: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0, // 1 paid, 0 not paid
  })
  status: number;

  @BelongsTo(() => Users)
  Student: Users;

  @BelongsTo(() => SessionSuivi)
  Formation: SessionSuivi;

  @BelongsTo(() => StagiaireHasSession)
  Session: StagiaireHasSession;
}
