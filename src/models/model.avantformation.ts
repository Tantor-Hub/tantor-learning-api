import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { StagiaireHasSession } from './model.stagiairehassession';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { IAvantFormationDocs } from 'src/interface/interface.formations';

@Table({ tableName: tables['avant_formation_docs'] })
export class AvantFormationDocs extends Model<IAvantFormationDocs> {

    @Column({ type: DataType.INTEGER, allowNull: true })
    @ForeignKey(() => StagiaireHasSession)
    session_id: number;
  
    @Column({ type: DataType.INTEGER, allowNull: true })
    @ForeignKey(() => Users)
    user_id: number;

    @Column(DataType.STRING) carte_identite?: string;
    @Column(DataType.STRING) contrat_ou_convention?: string;
    @Column(DataType.STRING) justificatif_domicile?: string;
    @Column(DataType.STRING) analyse_besoin?: string;
    @Column(DataType.STRING) formulaire_handicap?: string;
    @Column(DataType.STRING) convocation?: string;
    @Column(DataType.STRING) programme?: string;
    @Column(DataType.STRING) conditions_vente?: string;
    @Column(DataType.STRING) reglement_interieur?: string;
    @Column(DataType.STRING) cgv?: string;
    @Column(DataType.STRING) fiche_controle_initiale?: string;

    @BelongsTo(() => StagiaireHasSession, 'session_id')
    SessionStudent: StagiaireHasSession

    @BelongsTo(() => Users, 'user_id')
    Student: Users
}
