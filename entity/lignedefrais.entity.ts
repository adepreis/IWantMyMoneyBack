import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Mission } from "./mission.entity";
import { NoteDeFrais } from "./notedefrais.entity";
//ajouter a database.ts la classe 

export enum LIGNE_TYPE {
    DEPLACEMENT = "DEPLACEMENT",
    REPAS = "REPAS",
    LOGEMENT = "LOGEMENT",
    EVENEMENT_PROFESSIONNEL = "EVENEMENT PROFESSIONNEL",
    AUTRE = "AUTRE"
}

@Entity("lignedefrais")
export class LigneDeFrais {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: "varchar"})
    public titre!: string;

    @Column({type: "date"})
    public date!: Date;

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
    public type!: LIGNE_TYPE;

    @ManyToOne(() => NoteDeFrais)
    note!: NoteDeFrais;

    @ManyToOne(() => Mission)
    mission!: Mission;
}