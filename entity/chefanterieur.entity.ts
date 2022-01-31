import { Column, Entity, Index, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "./lignedefrais.entity";
import { IService, Service, serviceToApi } from "./service.entity";
//import { User } from "./user.entity";
//ajouter a database.ts la classe 

export interface IChefAnterieur {
    id: string,
    dateDebut: Date,
    dateFin: Date,
    //nom: string,
    //prenom: string
    //services: IService,
    //users : User[]
}

@Entity("chefanterieur")
export class ChefAnterieur {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: "date"})
    public dateDebut!: Date;

    @Column({type: "date"})
    public dateFin!: Date;

    //@Column({type: "varchar"})
    //public nom!: string;

    //@Column({type: "varchar"})
    //public prenom!: string;

    // OneToOne service

    //@ManyToMany user
}

export const chefanterieurToApi = (chefanterieur: ChefAnterieur): IChefAnterieur => {
    return {
        id: chefanterieur.id,
        dateDebut: chefanterieur.dateDebut,
        dateFin: chefanterieur.dateFin,
        //nom: chefanterieur.nom,
        //prenom: chefanterieur.prenom,
        //service: chefanterieur.service,
        //users
    };
}