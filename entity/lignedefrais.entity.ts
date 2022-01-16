import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IMission, Mission, missionToApi } from "./mission.entity";
import { NoteDeFrais } from "./notedefrais.entity";
import { LIGNE_TYPE } from "./utils";
//ajouter a database.ts la classe 

export interface ILigneDeFrais {
    id: string;
    titre: string;
    date: Date;
    validee: number;
    prixHT: number;
    prixTVA: number;
    justificatif: string;
    perdu: boolean;
    raison_avance: string;
    type: LIGNE_TYPE;
    mission: IMission
}

@Entity("lignedefrais")
export class LigneDeFrais implements ILigneDeFrais {
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

export const lineToApi = (ligne: LigneDeFrais): ILigneDeFrais => {
    console.log(ligne);
    return {
        id: ligne.id,
        titre: ligne.titre,
        date: ligne.date,
        validee: ligne.validee,
        prixHT: ligne.prixHT,
        prixTVA: ligne.prixTVA,
        justificatif: ligne.justificatif,
        perdu: ligne.perdu,
        raison_avance: ligne.raison_avance,
        type: ligne.type,
        mission: missionToApi(ligne.mission)
    };
}