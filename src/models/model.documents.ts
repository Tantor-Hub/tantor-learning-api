import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
    Default,
    AllowNull,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Cours } from './model.cours';
import { tables } from 'src/config/config.tablesname';

@Table({ tableName: tables['documents']})
export class Documents extends Model<Document> {
    @PrimaryKey
    @Default(uuidv4)
    @Column(DataType.UUID)
    id: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    nomFichier: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    url: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    type: string; // PDF, vidéo, Word...

    @ForeignKey(() => Cours)
    @Column(DataType.UUID)
    coursId: string;

    @BelongsTo(() => Cours)
    cours: Cours;
}
