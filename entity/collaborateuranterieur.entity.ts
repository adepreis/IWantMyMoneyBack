import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "./lignedefrais.entity";
import { IService, Service, serviceToApi } from "./service.entity";
import { User } from "./user.entity";
//import { User } from "./user.entity";
//ajouter a database.ts la classe 

export interface ICollaborateurAnterieur {
    id: string,
    dateDebut: Date,
    dateFin: Date,
}

@Entity("collaborateuranterieur")
export class CollaborateurAnterieur {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: "date"})
    public dateDebut!: Date;

    @Column({type: "date"})
    public dateFin!: Date;


    @ManyToOne(type => User, user => user.collaborateurAnterieur)
    collaborateurAnterieur!: User;

    @ManyToOne(() => Service, service => service.collaborateurAnterieur)
    service!: Service;
}

export const chefanterieurToApi = (chefanterieur: CollaborateurAnterieur): ICollaborateurAnterieur => {
    return {
        id: chefanterieur.id,
        dateDebut: chefanterieur.dateDebut,
        dateFin: chefanterieur.dateFin,
    };
}