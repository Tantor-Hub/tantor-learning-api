import { Table, Column, Model, DataType, HasMany, ForeignKey } from 'sequelize-typescript';
import { IRoles } from '../interface/interface.roles';
import { tables } from 'src/config/config.tablesname';
import { ICategorieFormations } from 'src/interface/interface.categoriesformations';
import { Thematiques } from './model.groupeformations';

@Table({ tableName: tables['categories'], timestamps: false })
export class Categories extends Model<ICategorieFormations> {
    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true, })
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    category: string;

    @Column({ type: DataType.STRING, allowNull: true, })
    description?: string;

    @ForeignKey(() => Thematiques)
    @Column({ allowNull: false })
    ThematicId: number;

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
    status: number
}
