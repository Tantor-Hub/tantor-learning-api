import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { StagiaireHasSession } from './model.stagiairehassession';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { IPendantFormationDocs } from 'src/interface/interface.formations';

@Table({ tableName: tables['pendant_formation_docs'] })
export class PendantFormationDocs extends Model<IPendantFormationDocs> {

  @Column({ type: DataType.INTEGER, allowNull: true })
  @ForeignKey(() => StagiaireHasSession)
  session_id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  @ForeignKey(() => Users)
  user_id: number;

  @Column convocation_examen: string;
  @Column attestation_formation: string;
  @Column certification: string;
  @Column fiche_controle_cours: string;
  @Column fiches_emargement: string;

  @BelongsTo(() => StagiaireHasSession, 'session_id')
  SessionStudent: StagiaireHasSession

  @BelongsTo(() => Users, 'user_id')
  Student: Users;
}
