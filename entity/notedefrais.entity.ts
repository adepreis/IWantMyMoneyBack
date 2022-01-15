import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Lignes } from "../pages/api/ligne/[ligne]";
import { LigneDeFrais } from "./lignedefrais.entity";
import { User } from "./user.entity";
//ajouter a database.ts la classe 

export const NOTEDEFRAIS_ETAT = {
    NON_VALIDEE: "NON_VALIDEE",
    EN_ATTENTE_DE_VALIDATION: "EN_ATTENTE_DE_VALIDATION",
    VALIDEE: "VALIDEE",
    REFUSEE: "REFUSEE"
}

@Entity("notedefrais")
export class NoteDeFrais {
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
    public etat!: string;

    @OneToMany(type => LigneDeFrais, ligne => ligne.note)
    ligne!: LigneDeFrais[];
}