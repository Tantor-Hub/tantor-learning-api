import {
    Table,
    Model,
    Column,
    DataType,
    Default,
    AllowNull,
    HasMany,
    ForeignKey,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Documents } from './model.documents';
import { Thematiques } from './model.groupeformations';
import { Categories } from './model.categoriesformations';
import { Users } from './model.users';
import { SessionSuivi } from './model.suivisession';
import { ICours } from 'src/interface/interface.cours';
import { Listcours } from './model.cours';

@Table({ tableName: tables['sessionhascours'] })
export class Cours extends Model<ICours> {
    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @ForeignKey(() => Listcours)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_preset_cours: number

    @AllowNull(true)
    @Column(DataType.FLOAT)
    duree: number; // en minutes

    @AllowNull(true)
    @Column(DataType.FLOAT)
    ponderation: number;

    @Default(false)
    @Column(DataType.BOOLEAN)
    is_published: boolean;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    createdBy: number;

    @ForeignKey(() => SessionSuivi)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id_session: number;

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

    @AllowNull(true)
    @ForeignKey(() => Users)
    @Column(DataType.INTEGER)
    id_formateur?: number;

    @HasMany(() => Documents)
    documents: Documents[];
}
