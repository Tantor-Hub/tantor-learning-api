import {
  Column,
  ForeignKey,
  Model,
  Table,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { StudentSession } from './model.studentsession';

@Table({ tableName: tables['reclamations_sanctions'] })
export class ReclamationsSanctions extends Model<ReclamationsSanctions> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => StudentSession)
  @Column({ type: DataType.UUID, allowNull: false })
  suivi_id: string;

  @Column commentaires: string;
  @Column preuves: string;
}
