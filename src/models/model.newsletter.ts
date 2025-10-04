import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  PrimaryKey,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { INewsletter } from 'src/interface/interface.newsletter';

@Table({ tableName: tables['newsletter'] })
export class Newsletter extends Model<INewsletter> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  user_email: string;

  @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
  status: number;
}
