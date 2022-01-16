import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "./lignedefrais.entity";
import { User } from "./user.entity";
import { NOTEDEFRAIS_ETAT } from "./utils";
//ajouter a database.ts la classe 

export interface INoteDeFrais {
    id: string,
    annee: number,
    mois: number,
    etat: NOTEDEFRAIS_ETAT,
    ligne: ILigneDeFrais[]
}

@Entity("notedefrais")
export class NoteDeFrais implements INoteDeFrais {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: "int"})
    public annee!: number;

    @Column({type: "int"})
    public mois!: number;

    @ManyToOne(() => User)
    user!: User;

    @Column({
        type: "enum",
        enum: Object.values(NOTEDEFRAIS_ETAT),
        default: NOTEDEFRAIS_ETAT.NON_VALIDEE
    })
    public etat!: NOTEDEFRAIS_ETAT;

    @OneToMany(type => LigneDeFrais, ligne => ligne.note)
    ligne!: LigneDeFrais[];
}

export const noteToApi = (note: NoteDeFrais): INoteDeFrais => {
    return {
        id: note.id,
        annee: note.annee,
        mois: note.mois,
        etat: note.etat,
        ligne: (note?.ligne ?? []).map(ligne => lineToApi(ligne))
    };
}