import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { IPayemenMethode } from 'src/interface/interface.payementmethode';
import { Users } from './model.users';

@Table({
  tableName: tables['payementmethode'],
  timestamps: true,
  indexes: [
    {
      name: 'unique_user_session_combo',
      unique: true,
      fields: ['id_user', 'id_session', 'id_session_student'],
    },
  ],
})
export class Payement extends Model<IPayemenMethode> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  id_stripe_payment: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_user: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_session: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_session_student: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  full_name: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  card_number?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  month?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  year?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cvv?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0, // 1 paid, 0 not paid 2 failed, 3 refunded, 4 disputed --- IGNORE ---
  })
  status: number;

  @BelongsTo(() => Users, { foreignKey: 'id_user', targetKey: 'id' })
  Stagiaire: Users;
}
