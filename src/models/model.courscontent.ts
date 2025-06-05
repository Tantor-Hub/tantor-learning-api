import { Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, HasMany } from 'sequelize-typescript';
import { Chapitre } from './model.chapitres';
import { IContent } from 'src/interface/interface.cours';

@Table({ tableName: 'cours_contents', timestamps: false })
export class CoursContent extends Model<IContent> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull(false)
    @Column
    id_cours: number;

    @HasMany(() => Chapitre)
    Chapitres: Chapitre[];
}