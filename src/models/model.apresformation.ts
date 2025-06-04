import { BelongsTo, Column, ForeignKey, HasOne, Model, Table } from 'sequelize-typescript';
import { StagiaireHasSession } from './model.stagiairehassession';
import { tables } from 'src/config/config.tablesname';
import { UploadDocument } from './model.documentsession';
import { DocumentKeyEnum } from 'src/utils/utiles.documentskeyenum';
import { Users } from './model.users';

@Table({ tableName: tables['apres_formation_docs'] })
export class ApresFormationDocs extends Model<ApresFormationDocs> {
  @ForeignKey(() => StagiaireHasSession)
  @Column
  session_id: number;

  @ForeignKey(() => Users)
  @Column
  user_id: number;

  @Column questionnaire_satisfaction: string;
  @Column paiement: string;
  @Column documents_financeur: string;
  @Column fiche_controle_finale: string;

  @BelongsTo(() => StagiaireHasSession, 'session_id')
  SessionStudent: StagiaireHasSession

  @BelongsTo(() => Users, 'user_id')
  Student: Users

  @HasOne(() => UploadDocument, {
    sourceKey: 'session_id',
    foreignKey: 'id_session',
    scope: {
      key_document: DocumentKeyEnum.QUESTIONNAIRE_SATISFACTION,
    },
    constraints: false,
  })
  QuestionnaireSatisfactionDoc: UploadDocument;

  @HasOne(() => UploadDocument, {
    sourceKey: 'session_id',
    foreignKey: 'id_session',
    scope: {
      key_document: DocumentKeyEnum.PAIEMENT,
    },
    constraints: false,
  })
  PaiementDoc: UploadDocument;

  @HasOne(() => UploadDocument, {
    sourceKey: 'session_id',
    foreignKey: 'id_session',
    scope: {
      key_document: DocumentKeyEnum.DOCUMENTS_FINANCEUR,
    },
    constraints: false,
  })
  DocumentsFinanceurDoc: UploadDocument;

  @HasOne(() => UploadDocument, {
    sourceKey: 'session_id',
    foreignKey: 'id_session',
    scope: {
      key_document: DocumentKeyEnum.FICHE_CONTROLE_FINALE,
    },
    constraints: false,
  })
  FicheControleFinaleDoc: UploadDocument;
}