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
import { IPaymentMethodCard } from 'src/interface/interface.paymentmethodcard';
import { PaymentMethodCardStatus } from 'src/enums/payment-method-card-status.enum';
import { TrainingSession } from './model.trainingssession';
import { Users } from './model.users';

@Table({
  tableName: tables['paymentmethodcard'],
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id_user', 'id_session'],
      name: 'unique_user_session_payment_card',
    },
  ],
})
export class PaymentMethodCard extends Model<IPaymentMethodCard> {
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
    type: DataType.UUID,
    allowNull: true,
  })
  id_stripe_payment: string | null;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_user: string;

  @Column({
    type: DataType.ENUM('pending', 'rejected', 'validated'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: PaymentMethodCardStatus;

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
