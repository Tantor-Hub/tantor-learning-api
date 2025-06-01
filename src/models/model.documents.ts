import {
    Table,
    Model,
    Column,
    DataType,
    ForeignKey,
    BelongsTo,
    AllowNull,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { Cours } from './model.sessionshascours';

@Table({ tableName: tables['documents']})
export class Documents extends Model<Document> {
    @Column({ type: DataType.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    file_name: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    url: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    type: string; // PDF, vidéo, Word...

    @ForeignKey(() => Cours)
    @Column(DataType.INTEGER)
    id_cours: number;

    @BelongsTo(() => Cours)
    cours: Cours;
}
