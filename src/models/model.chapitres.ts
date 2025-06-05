import { Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { CoursContent } from './model.courscontent';

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
    @Column(DataType.ARRAY(DataType.STRING)) // PostgreSQL uniquement
    paragraphes: string[];

    @ForeignKey(() => CoursContent)
    @Column
    coursContentId: number;

    @BelongsTo(() => CoursContent)
    coursContent: CoursContent;
}