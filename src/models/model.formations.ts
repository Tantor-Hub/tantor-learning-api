import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
} from 'sequelize-typescript';
import { Categories } from './model.categoriesformations';
import { tables } from 'src/config/config.tablesname';
import { IFormation } from 'src/interface/interface.formations';
import { Thematiques } from './model.groupeformations';

@Table({ tableName: tables['fromations'] })
export class Formations extends Model<IFormation> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    titre: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    sous_titre: string;

    @ForeignKey(() => Categories)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_category: number;

    @ForeignKey(() => Thematiques)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_thematic: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 1
    })
    status?: number
}
