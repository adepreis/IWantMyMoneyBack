import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NoteDeFrais } from "./NoteDeFrais.entity";
//ajouter a database.ts la classe 

export const LIGNE_TYPE = {
    DEPLACEMENT: "DEPLACEMENT",
    REPAS: "REPAS",
    LOGEMENT: "LOGEMENT",
    EVENEMENT_PROFESSIONNEL: "EVENEMENT PROFESSIONNEL",
    AUTRE: "AUTRE",
}

@Entity("lignedefrais")
export class LigneDeFrais {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @Column({type: "varchar"})
    public titre!: string;

    @Column({type: "date"})
    public moisAnnee!: Date;

    @Column({type: "int"})
    public validee!: number;

    @Column({type: "float"})
    public prixHT!: number;

    @Column({type: "float"})
    public prixTTC!: number;

    @Column({type: "float"})
    public prixTVA!: number;

    @Column({type: "varchar"})
    public justificatif!: string;

    @Column({type: "bool"})
    public perdu!: boolean;
    
    @Column({type: "bool"})
    public avance!: boolean;

    @Column({type: "varchar"})
    public raison_avance!: string;

    @Column({
        type: "enum",
        enum: Object.values(LIGNE_TYPE)
    })
    public type!: string;

    @ManyToOne(() => NoteDeFrais)
    note!: NoteDeFrais;
}