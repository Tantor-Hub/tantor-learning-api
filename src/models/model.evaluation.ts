import { Table, Column, Model, HasMany, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Question } from './model.quiz';
import { Cours } from './model.sessionshascours';
import { IEvaluation } from 'src/interface/interface.cours';
import { table_prefix } from 'src/config/config.tablesname';
import { SessionSuivi } from './model.suivisession';

@Table({ tableName: `${table_prefix}evaluations`, timestamps: true, })
export class Evaluation extends Model<IEvaluation> {
    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @Column({ type: DataType.FLOAT, allowNull: true, defaultValue: 0 })
    estimatedDuration: number;

    @Column({ type: DataType.FLOAT, allowNull: true })
    score: number;

    @Column({ type: DataType.BOOLEAN, allowNull: true })
    is_finished: false;

    @ForeignKey(() => Cours)
    @Column
    id_cours: number;

    @ForeignKey(() => SessionSuivi)
    @Column
    id_session: number;

    @Column({ type: DataType.STRING, allowNull: true })
    evaluation_type: string;

    @Column({ type: DataType.STRING, allowNull: true })
    evaluation_condition: string; // 'en ligne' ou 'présentiel'

    @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
    has_jury: boolean;

    @Column({ type: DataType.STRING, allowNull: true })
    location: string; // adresse ou salle

    @Column({ type: DataType.DATE, allowNull: true })
    datetime: Date;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        set(value: string[] | string) {
            const val = Array.isArray(value) ? JSON.stringify(value) : value;
            this.setDataValue('allowed_materials', val);
        },
        get() {
            const raw = this.getDataValue('allowed_materials');
            try {
                return JSON.parse(raw);
            } catch {
                return [];
            }
        }
    })
    allowed_materials: string[];

    @BelongsTo(() => Cours)
    Cours: Cours;

    @BelongsTo(() => SessionSuivi)
    Session: SessionSuivi;

    @HasMany(() => Question)
    Questions: Question[];
}
