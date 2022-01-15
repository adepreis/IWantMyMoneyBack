import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
//ajouter a database.ts la classe 

@Entity("notedefrais")
export class NoteDeFrais {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @Column({type: "varchar"})
    public moisAnnee!: string;

    @ManyToOne(() => User)
    user!: User;
}