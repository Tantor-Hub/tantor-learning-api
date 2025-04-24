import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { IStagiaireHasSessionSuiivi } from 'src/interface/interface.stagiairehassession';
import { SessionSuivi } from './model.suivisession';

@Table({ tableName: tables['statgiairehassession'], timestamps: true })
export class StagiaireHasSession extends Model<IStagiaireHasSessionSuiivi> {

    @Column({ type: DataType.INTEGER })
    id_controleur: number;

    @Column(DataType.STRING)
    id_superviseur: string;

    @Column(DataType.DATE)
    date_mise_a_jour: Date;

    @Column({ type: DataType.INTEGER })
    id_formation: number;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => SessionSuivi)
    id_sessionsuivi: number;

    @Column({ type: DataType.INTEGER })
    controleur: number;

    @Column({ type: DataType.STRING, unique: true })
    numero_stagiaire: string;

    @Column({ type: DataType.STRING, unique: true })
    @ForeignKey(() => Users)
    id_stagiaire: number;

    @Column(DataType.STRING)
    type_prestation: string;

    @Column(DataType.DATE)
    date_relance: Date;

    @Column(DataType.STRING)
    moyen_relance: string;

    @Column(DataType.STRING)
    reponse_detaillee: string;

    @Column(DataType.BOOLEAN)
    action_a_reprendre: boolean;

    @Column(DataType.STRING)
    superviseur: string;

    @Column(DataType.BOOLEAN)
    supervision: boolean;

    @Column(DataType.DATE)
    date_supervision: Date;

    @Column(DataType.TEXT)
    commentaires: string;
}
