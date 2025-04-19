import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
} from 'sequelize-typescript';
import { Categories } from './model.categoriesformations';
import { Users } from './model.users';
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

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    piece_jointe: string;

    @Column({
        type: DataType.ENUM('onLine', 'visionConference', 'presentiel', 'hybride'),
        allowNull: false,
    })
    type_formation: string;

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

    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_formateur: number | null;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    duree: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    start_on: Date | string | any;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    end_on: Date | string | any;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    prix: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 1
    })
    status?: number
}
