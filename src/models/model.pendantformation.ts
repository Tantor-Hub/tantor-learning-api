import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { StagiaireHasSession } from './model.stagiairehassession';
import { tables } from 'src/config/config.tablesname';

@Table({ tableName: tables['pendant_formation_docs'] })
export class PendantFormationDocs extends Model<PendantFormationDocs> {
  @ForeignKey(() => StagiaireHasSession)
  @Column
  session_id: number;

  @Column convocation_examen: string;
  @Column attestation_formation: string;
  @Column certification: string;
  @Column fiche_controle_cours: string;
  @Column fiches_emargement: string;

  @BelongsTo(() => StagiaireHasSession, 'session_id')
  SessionStudent: StagiaireHasSession
}
