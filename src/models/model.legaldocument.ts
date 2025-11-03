import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Users } from './model.users';
import { ILegalDocument } from 'src/interface/interface.legaldocument';

export enum LegalDocumentType {
  CODE_ETHIQUE = 'CODE_ETHIQUE',
  CONDITIONS_GENERALES_UTILISATION = 'CONDITIONS_GENERALES_UTILISATION',
  CONDITIONS_GENERALES_SERVICE = 'CONDITIONS_GENERALES_SERVICE',
  MENTIONS_LEGALES = 'MENTIONS_LEGALES',
  REGLEMENT_INTERIEUR = 'REGLEMENT_INTERIEUR',
  POLITIQUE_GLOBALE_RECLAMATIONS = 'POLITIQUE_GLOBALE_RECLAMATIONS',
  POLITIQUE_PROTECTION_DONNEES = 'POLITIQUE_PROTECTION_DONNEES',
}

@Table({
  tableName: tables['legaldocuments'],
  timestamps: true,
})
export class LegalDocument extends Model<ILegalDocument> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.ENUM(
      'CODE_ETHIQUE',
      'CONDITIONS_GENERALES_UTILISATION',
      'CONDITIONS_GENERALES_SERVICE',
      'MENTIONS_LEGALES',
      'REGLEMENT_INTERIEUR',
      'POLITIQUE_GLOBALE_RECLAMATIONS',
      'POLITIQUE_PROTECTION_DONNEES',
    ),
    allowNull: false,
    unique: true,
  })
  type: LegalDocumentType;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  content?: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  updatedBy?: string;

  @BelongsTo(() => Users, { foreignKey: 'updatedBy', targetKey: 'id' })
  updatedByUser?: Users;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
