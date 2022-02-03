import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChefAnterieur, chefanterieurToApi, IChefAnterieur } from "./chefanterieur.entity";
import { IMission, Mission, missionToApi } from "./mission.entity";
import { User } from "./user.entity";
//ajouter a database.ts la classe 

export interface IService {
    id: string,
    nom: string,
    missions: IMission[],
    chefsAnterieurs: IChefAnterieur[]
    //collaborateursAnterieurs: User[] (ManyToMany)
}

@Entity("service")
export class Service {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column({type: "varchar"})
    public nom!: string;

    @OneToMany(type => Mission, mission => mission.service)
    missions!: Mission[];

    @OneToMany(type => ChefAnterieur, chefAnterieur => chefAnterieur.service)
    chefsAnterieurs!: ChefAnterieur[];

    @ManyToMany(type => User, collaborateursAnterieurs => collaborateursAnterieurs.servicesAnterieurs)
    @JoinTable()
    collaborateursAnterieurs!: User[];
    // (avec servicesAnterieurs de User)
}

export const serviceToApi = (service: Service): IService => {
    return {
        id: service.id,
        nom: service.nom,
        missions: (service?.missions ?? []).map(missions => missionToApi(missions)),
        chefsAnterieurs: (service?.chefsAnterieurs ?? []).map(chefsAnterieurs => chefanterieurToApi(chefsAnterieurs))
        //collaborateursAnterieurs: (ManyToMany)
    };
}