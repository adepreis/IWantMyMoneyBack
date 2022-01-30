import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Service } from "./service.entity";
//ajouter a database.ts la classe 

export interface IMission {
    id: string,
    titre: string,
    dateDebut: Date,
    dateFin: Date,
    description: string
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
}

export const missionToApi = (misson: Mission): IMission => {
    return {
        id: misson.id,
        titre: misson.titre,
        dateDebut: misson.dateDebut,
        dateFin: misson.dateFin,
        description: misson.description
    };
}