import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ISessiondocument } from 'src/interface/interface.sessiondocument';
import { Session } from './model.session';
import { Users } from './model.users';

@Table({ tableName: tables['sessiondocument'] })
export class Sessiondocument extends Model<ISessiondocument> {
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

  @AllowNull(false)
  @Column(DataType.STRING)
  piece_jointe: string; // URL or file path

  @AllowNull(true)
  @Column(DataType.STRING)
  type: string; // PDF, Word...

  @AllowNull(false)
  @Column(DataType.ENUM('pendant', 'durant', 'apres'))
  category: string;

  @ForeignKey(() => Session)
  @Column(DataType.INTEGER)
  id_session: number;

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  createdBy: number;

  @BelongsTo(() => Session)
  session: Session;
}
