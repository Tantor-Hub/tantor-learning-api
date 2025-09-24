import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ISession } from 'src/interface/interface.session';
import { Users } from './model.users';
import { Formations } from './model.formations';
import { FormationType } from 'src/utils/utiles.typesformations';
import { Training } from './model.trainings';

@Table({ tableName: tables['sessions'] })
export class Session extends Model<ISession> {
  @Column({
    type: DataType.UUID,
    allowNull: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  title: string;

  @ForeignKey(() => Training)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id_trainings: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  progression: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  nb_places: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  nb_places_disponible: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  text_reglement: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  required_documents: string[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date_session_debut: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date_session_fin: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  duree: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  createdBy: string;



  @BelongsTo(() => Users, { foreignKey: 'createdBy' })
  CreatedBy: Users;
}
