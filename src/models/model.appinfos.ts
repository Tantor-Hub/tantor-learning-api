import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';

@Table({ tableName: tables['appinfos'] })
export class AppInfos extends Model<AppInfos> {
    @Column({ type: DataType.JSON, defaultValue: [] })
    contacts_numbers?: string[];

    @Column
    email_contact: string;

    @Column
    adresse: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    about_app: string;
}