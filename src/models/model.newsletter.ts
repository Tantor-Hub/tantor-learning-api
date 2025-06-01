import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { INewsletter } from 'src/interface/interface.newsletter';

@Table({ tableName: tables['newsletter'] })
export class Newsletter extends Model<INewsletter> {
    @Column({ type: DataType.STRING, allowNull: false })
    user_email: string;
}