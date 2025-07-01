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
import { DocumentKeyEnum } from 'src/utils/utiles.documentskeyenum';
import { IUploadDocument, } from 'src/interface/interface.document';

@Table({ tableName: 'upload_documents', timestamps: true })
export class UploadDocument extends Model<IUploadDocument> {
  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_student: number;

  @ForeignKey(() => StagiaireHasSession)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_session: number;

  @Column({ type: DataType.STRING, allowNull: false })
  document: string;

  @Column({ type: DataType.STRING, allowNull: false })
  piece_jointe: string;

  @Column({ type: DataType.ENUM(...Object.keys(DocumentKeyEnum)), allowNull: false })
  key_document: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @BelongsTo(() => Users)
  Student: Users;

  @BelongsTo(() => StagiaireHasSession)
  Session: StagiaireHasSession;
}
