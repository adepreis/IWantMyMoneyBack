import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "./lignedefrais.entity";
import { IService, Service, serviceToApi } from "./service.entity";
import { User } from "./user.entity";
//import { User } from "./user.entity";
//ajouter a database.ts la classe 

export interface IChefAnterieur {
    id: string,
    dateDebut: Date,
    dateFin: Date,
    //nom: string,
    //prenom: string,
    //chefAnterieur: User (ManyToOne)
    //service: IService (ManyToOne)
}

@Entity("chefanterieur")
export class ChefAnterieur {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: "date"})
    public dateDebut!: Date;

    @Column({type: "date", nullable:true})
    public dateFin!: Date;

    //@Column({type: "varchar"})
    //public nom!: string;

    //@Column({type: "varchar"})
    //public prenom!: string;

    @ManyToOne(type => User, user => user.chefsAnterieurs)
    chefAnterieur!: User;

    @ManyToOne(() => Service, service => service.chefsAnterieurs)
    service!: Service;

    @ManyToOne(() => Service)
    serviceValidateur!: Service;
}

export const chefanterieurToApi = (chefanterieur: ChefAnterieur): IChefAnterieur => {
    return {
        id: chefanterieur.id,
        dateDebut: chefanterieur.dateDebut,
        dateFin: chefanterieur.dateFin,
        //nom: chefanterieur.nom,
        //prenom: chefanterieur.prenom,
        //chefAnterieur: (ManyToOne)
        //service: (ManyToOne)
    };
}