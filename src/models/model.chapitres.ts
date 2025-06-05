import { Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Cours } from './model.sessionshascours';

@Table({ tableName: 'chapitres', timestamps: false })
export class Chapitre extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull(false)
    @Column
    chapitre: string;

    @AllowNull(false)
    @Column
    @ForeignKey(() => Cours)
    id_cours: number;

    @AllowNull(false)
    @Column(DataType.ARRAY(DataType.STRING)) // PostgreSQL uniquement
    paragraphes: string[];
}