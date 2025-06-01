import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ISessionSuivi } from 'src/interface/interface.suivisession';
import { Categories } from './model.categoriesformations';
import { Thematiques } from './model.groupeformations';
import { Users } from './model.users';

@Table({ tableName: tables['sessionsuivi'], timestamps: true })
export class SessionSuivi extends Model<ISessionSuivi> {

    @Column({ type: DataType.STRING })
    designation?: string;

    @Column({ type: DataType.INTEGER })
    id_controleur?: number;

    @Column({ type: DataType.INTEGER, allowNull: true })
    @ForeignKey(() => Users)
    id_superviseur?: number;

    @Column({ type: DataType.UUID, allowNull: false, unique: true })
    uuid?: string;

    @Column(DataType.DATE)
    date_mise_a_jour?: Date;

    @Column(DataType.STRING)
    duree?: string;

    @Column(DataType.FLOAT)
    progression?: number;

    @Column({ type: DataType.INTEGER })
    id_formation: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    piece_jointe?: string;

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

    @Column(DataType.DATE)
    date_session_debut: Date;

    @Column(DataType.DATE)
    date_session_fin: Date;

    @Column(DataType.TEXT)
    description: string

    @Column(DataType.FLOAT)
    prix?: number;

    @Column({ type: DataType.FLOAT, defaultValue: 1, allowNull: true })
    status?: number;

    @BelongsTo(() => Users)
    Superviseur: Users;
}
