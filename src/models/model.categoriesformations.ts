import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { IRoles } from '../interface/interface.roles';
import { tables } from 'src/config/config.tablesname';
import { ICategorieFormations } from 'src/interface/interface.categoriesformations';

@Table({ tableName: tables['categories'], timestamps: false })
export class Categories extends Model<ICategorieFormations> {
    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true, })
    id: number;

    @Column({
        type: DataType.ENUM('onLine', 'visioConference', 'presentiel', 'hybride'),
        allowNull: false,
        unique: true,
        defaultValue: 'onLine'
    })
    category: string;

    @Column({ type: DataType.STRING, allowNull: true, })
    description?: string;

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
    status: number
}
