import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IContact } from 'src/interface/interface.contactform';

@Table({ tableName: tables['contacts'] })
export class Contacts extends Model<IContact> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  from_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  from_mail: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  subject: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  piece_jointe?: string;
}
