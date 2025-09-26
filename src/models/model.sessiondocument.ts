import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { ISessionDocument } from 'src/interface/interface.sessiondocument';
import { TrainingSession } from './model.trainingssession';
import { Users } from './model.users';

@Table({ tableName: tables['sessiondocuments'] })
export class SessionDocument extends Model<ISessionDocument> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  type: string;

  @ForeignKey(() => Users)
  @Column(DataType.UUID)
  id_student: string;

  @ForeignKey(() => TrainingSession)
  @Column(DataType.UUID)
  id_session: string;

  @AllowNull(false)
  @Column(DataType.ENUM('before', 'during', 'after'))
  categories: 'before' | 'during' | 'after';

  @AllowNull(true)
  @Column(DataType.STRING)
  piece_jointe?: string;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'rejected', 'validated'))
  status: 'pending' | 'rejected' | 'validated';

  @BelongsTo(() => Users, { foreignKey: 'id_student', targetKey: 'uuid' })
  student: Users;

  @BelongsTo(() => TrainingSession, 'id_session')
  trainingSession: TrainingSession;
}
