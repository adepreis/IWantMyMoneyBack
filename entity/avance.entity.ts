import { Column, Entity, Index, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IMission, Mission } from "./mission.entity";
import { User } from "./user.entity";

//ajouter a database.ts la classe 

export interface IAvance {
    id: string,
    montant: number,
    rembourse: number,
    //mission: IMission,
    //user:
}

@Entity("avance")
export class Avance {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column({type: "float"})
    public montant!: number;

    @Column({type: "float"})
    public rembourse!: number;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => Mission)
    mission!: Mission;
}

export const avanceToApi = (avance: Avance): IAvance => {
    return {
        id: avance.id,
        montant: avance.montant,
        rembourse: avance.rembourse,
        //mission: avance.mission,
        //users
    };
}