import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { StagiaireHasSession } from './model.stagiairehassession';
import { tables } from 'src/config/config.tablesname';

@Table({ tableName: tables['reclamations_sanctions'] })
export class ReclamationsSanctions extends Model<ReclamationsSanctions> {
  @ForeignKey(() => StagiaireHasSession)
  @Column
  suivi_id: number;

  @Column commentaires: string;
  @Column preuves: string;
}