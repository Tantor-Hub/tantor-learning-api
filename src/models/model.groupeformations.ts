import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IGroupeFormations } from 'src/interface/interface.groupefromation';
import { Categories } from './model.categoriesformations';

@Table({ tableName: tables['groupefromations'], timestamps: false })
export class Thematiques extends Model<IGroupeFormations> {
    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true, })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    thematic: string;

    @Column({ type: DataType.STRING, allowNull: true, })
    description: string;

    @HasMany(() => Categories)
    categories: Categories[];

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
    status: number
}
