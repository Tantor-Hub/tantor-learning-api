import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: tables['bookcategories'],
  timestamps: true,
})
export class BookCategory extends Model<BookCategory> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  title: string;
}
