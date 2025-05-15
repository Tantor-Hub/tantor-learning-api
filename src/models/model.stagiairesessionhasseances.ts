import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { SessionSuivi } from './model.suivisession';
import { IStagiaireHasSessionSuiiviSeance } from 'src/interface/interface.stagiairesessionhasseances';

@Table({ tableName: tables['statgiairehassessionhasseance'], timestamps: true })
export class StagiaireHasSessionSeances extends Model<IStagiaireHasSessionSuiiviSeance> {

    @Column({ type: DataType.INTEGER })
    id_controleur: number;

    @Column({ type: DataType.INTEGER })
    id_superviseur: number;

    @Column({ type: DataType.DATE })
    date_mise_a_jour: Date;

    @Column({ type: DataType.INTEGER }) // in unix c'est mieux
    date_de_seance: number;

    @Column({ type: DataType.INTEGER })
    id_formation: number;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => SessionSuivi)
    id_sessionsuivi: number;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => Users)
    id_stagiaire: number;

    @Column({ type: DataType.STRING, unique: true })
    numero_stagiaire: string;

    @Column({ type: DataType.STRING, allowNull: true })
    type_prestation: string;

    @Column({ type: DataType.DATE, allowNull: true })
    date_relance: Date;

    @Column({ type: DataType.STRING, allowNull: true })
    moyen_relance: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    reponse_detaillee: string;

    @Column({ type: DataType.BOOLEAN, allowNull: true })
    action_a_reprendre: boolean;

    @Column({ type: DataType.BOOLEAN, allowNull: true })
    supervision: boolean;

    @Column({ type: DataType.DATE, allowNull: true })
    date_supervision: Date;

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0 })
    presence?: number;
}
