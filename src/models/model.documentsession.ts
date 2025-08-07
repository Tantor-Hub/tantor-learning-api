import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Users } from './model.users';
import { StagiaireHasSession } from './model.stagiairehassession';
import { DocumentKeyEnum, StepsDocumentsSessionKeys } from 'src/utils/utiles.documentskeyenum';
import { IUploadDocument, } from 'src/interface/interface.document';
import { tables } from 'src/config/config.tablesname';
import { SessionSuivi } from './model.suivisession';

@Table({ tableName: tables['documentsstudents'], timestamps: true })
export class UploadDocument extends Model<IUploadDocument> {
  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_student: number;

  @ForeignKey(() => SessionSuivi)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_session: number;

  @ForeignKey(() => StagiaireHasSession)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  id_session_student: number;

  @Column({ type: DataType.STRING, allowNull: false })
  document: string; // non du document

  @Column({ type: DataType.STRING, allowNull: false })
  piece_jointe: string;

  @Column({ type: DataType.ENUM(...Object.keys(StepsDocumentsSessionKeys)), allowNull: false })
  group: string;

  @Column({ type: DataType.ENUM(...Object.keys(DocumentKeyEnum)), allowNull: false })
  key_document: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @BelongsTo(() => Users, {
    onDelete: 'CASCADE',
  })
  Student: Users;

  @BelongsTo(() => SessionSuivi, {
    onDelete: 'CASCADE',
  })
  Session: SessionSuivi;

  @BelongsTo(() => StagiaireHasSession, {
    onDelete: 'CASCADE',
  })
  SessionStagiaire: StagiaireHasSession;
}
