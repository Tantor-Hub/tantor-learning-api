import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { StagiaireHasSession } from './model.stagiairehassession';
import { tables } from 'src/config/config.tablesname';

@Table({ tableName: tables['apres_formation_docs'] })
export class ApresFormationDocs extends Model<ApresFormationDocs> {
  @ForeignKey(() => StagiaireHasSession)
  @Column
  suivi_id: number;

  @Column questionnaire_satisfaction: string;
  @Column paiement: string;
  @Column documents_financeur: string;
  @Column fiche_controle_finale: string;
}