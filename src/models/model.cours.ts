import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    Default,
    AllowNull,
    HasMany,
} from 'sequelize-typescript';
import { tables } from 'src/config/config.tablesname';
import { v4 as uuidv4 } from 'uuid';
import { Documents } from './model.documents';

@Table({ tableName: tables['cours'] })
export class Cours extends Model<Cours> {
    @PrimaryKey
    @Default(uuidv4)
    @Column(DataType.UUID)
    id: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    titre: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    description: string;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    datePublication: Date;

    @Default(false)
    @Column(DataType.BOOLEAN)
    estPublie: boolean;

    @AllowNull(true)
    @Column(DataType.UUID)
    auteurId: string;

    @HasMany(() => Documents)
    documents: Documents[];
}
