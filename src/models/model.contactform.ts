import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IContact } from 'src/interface/interface.contactform';

@Table({ tableName: tables['contacts'] })
export class Contacts extends Model<IContact> {
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
}
