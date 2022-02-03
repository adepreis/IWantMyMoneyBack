import { Column, Entity, Index, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Avance, avanceToApi, IAvance } from "./avance.entity";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "./lignedefrais.entity";
import { IService, Service } from "./service.entity";
//import { User } from "./user.entity";
//ajouter a database.ts la classe 

export interface IMission {
    id: string,
    titre: string,
    dateDebut: Date,
    dateFin: Date,
    description: string,
    //service: IService,
    avances : IAvance[],
    // lignes: ILigneDeFrais[]
}

@Entity("mission")
export class Mission {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column({type: "varchar"})
    public titre!: string;

    @Column({type: "date"})
    public dateDebut!: Date;

    @Column({type: "date"})
    public dateFin!: Date;

    @Column({type: "varchar"})
    public description!: string;

    @ManyToOne(() => Service)
    service!: Service;

    @OneToMany(type => Avance, avances => avances.mission)
    avances!: Avance[];

    @OneToMany(type => LigneDeFrais, lignes => lignes.mission)
    lignes!: LigneDeFrais[];
}

export const missionToApi = (mission: Mission): IMission => {
    return {
        id: mission.id,
        titre: mission.titre,
        dateDebut: mission.dateDebut,
        dateFin: mission.dateFin,
        description: mission.description,
        //service:
        avances: (mission?.avances ?? []).map(avances => avanceToApi(avances)),
        // lignes: (mission?.lignes ?? []).map(lignes => lineToApi(lignes))
    };
}