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
import { IStudentSession } from '../interface/interface.studentsession';
import { TrainingSession } from './model.trainingssession';
import { Users } from './model.users';

@Table({ tableName: tables['studentsession'], timestamps: true })
export class StudentSession extends Model<IStudentSession> {
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

  @BelongsTo(() => TrainingSession, {
    foreignKey: 'id_session',
    targetKey: 'id',
  })
  trainingSession: TrainingSession;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_student: string;

  @BelongsTo(() => Users, {
    foreignKey: 'id_student',
    targetKey: 'id',
  })
  student: Users;

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
}
