import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
//ajouter a database.ts la classe 

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
}