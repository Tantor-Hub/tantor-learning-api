import {
    Table,
    Model,
    Column,
    DataType,
    AllowNull,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
@Table({ tableName: tables['cours'] })
export class Listcours extends Model<Listcours> {
    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    title: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    description: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    createdBy: number;
}
