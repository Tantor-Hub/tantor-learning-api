import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IPaymentMethodOpco } from 'src/interface/interface.paymentmethodopco';
import { PaymentMethodOpcoStatus } from 'src/enums/payment-method-opco-status.enum';
import { TrainingSession } from './model.trainingssession';
import { Users } from './model.users';

@Table({
  tableName: tables['paymentmethodopco'],
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id_user', 'id_session'],
      name: 'unique_user_session_payment_opco',
    },
  ],
})
export class PaymentMethodOpco extends Model<IPaymentMethodOpco> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => TrainingSession)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_session: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nom_opco: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nom_entreprise: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  siren: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nom_responsable: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  telephone_responsable: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email_responsable: string;

  @Column({
    type: DataType.ENUM('pending', 'rejected', 'validated'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: PaymentMethodOpcoStatus;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_user: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => TrainingSession, {
    foreignKey: 'id_session',
    targetKey: 'id',
  })
  trainingSession: TrainingSession;

  @BelongsTo(() => Users, {
    foreignKey: 'id_user',
    targetKey: 'id',
  })
  user: Users;
}
