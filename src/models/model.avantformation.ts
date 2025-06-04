import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { StagiaireHasSession } from './model.stagiairehassession';
import { tables } from 'src/config/config.tablesname';

@Table({ tableName: tables['avant_formation_docs'] })
export class AvantFormationDocs extends Model<AvantFormationDocs> {
    @ForeignKey(() => StagiaireHasSession)
    @Column
    session_id: number; 

    @Column(DataType.STRING) carte_identite: string;
    @Column(DataType.STRING) contrat_ou_convention: string;
    @Column(DataType.STRING) justificatif_domicile: string;
    @Column(DataType.STRING) analyse_besoin: string;
    @Column(DataType.STRING) formulaire_handicap: string;
    @Column(DataType.STRING) convocation: string;
    @Column(DataType.STRING) programme: string;
    @Column(DataType.STRING) conditions_vente: string;
    @Column(DataType.STRING) reglement_interieur: string;
    @Column(DataType.STRING) cgv: string;
    @Column(DataType.STRING) fiche_controle_initiale: string;

    @BelongsTo(() => StagiaireHasSession, 'session_id')
    SessionStudent: StagiaireHasSession
}
