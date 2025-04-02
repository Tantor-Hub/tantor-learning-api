import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { IRoles } from '../interface/interface.roles';
import { tables } from 'src/config/config.tablesname';

@Table({ tableName: tables['roles'], timestamps: false })
export class Roles extends Model<IRoles> {
    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true, })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    role: string;

    @Column({ type: DataType.STRING, allowNull: true, })
    description: string;

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
    status: number

}
