import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  Default,
  Index,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IPaymentMethodCpf } from 'src/interface/interface.paymentmethodcpf';
import { PaymentMethodCpfStatus } from 'src/enums/payment-method-cpf-status.enum';
import { TrainingSession } from './model.trainingssession';
import { Users } from './model.users';

@Table({
  tableName: tables['paymentmethodcpf'],
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id_user', 'id_session'],
      name: 'unique_user_session_payment_cpf',
    },
  ],
})
export class PaymentMethodCpf extends Model<IPaymentMethodCpf> {
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
    type: DataType.ENUM('pending', 'rejected', 'validated'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: PaymentMethodCpfStatus;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_user: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  updatedBy: string;

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

  @BelongsTo(() => Users, {
    foreignKey: 'updatedBy',
    targetKey: 'id',
  })
  updatedByUser: Users;
}
