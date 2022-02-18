import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ILigneDeFrais, LigneDeFrais, lineToApi } from "./lignedefrais.entity";
import { INotification, Notification, notificationToApi } from "./notification.entity";
import { User } from "./user.entity";
import { NOTEDEFRAIS_ETAT } from "./utils";
//ajouter a database.ts la classe 

export interface INoteDeFrais {
    id: string,
    mois: number,
    annee: number,
    etat: NOTEDEFRAIS_ETAT,
    //user: User
    lignes: ILigneDeFrais[],
    notifications: INotification[]
}

@Entity("notedefrais")
@Unique(["user","mois","annee"]) //clé unique pour qu'il puisse pas y avoire plusieur note pour 1 mois
export class NoteDeFrais implements INoteDeFrais {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: "int"})
    public mois!: number;

    @Column({type: "int"})
    public annee!: number;

    @Column({
        type: "enum",
        enum: Object.values(NOTEDEFRAIS_ETAT),
        default: NOTEDEFRAIS_ETAT.BROUILLON
    })
    public etat!: NOTEDEFRAIS_ETAT;

    @ManyToOne(() => User)
    user!: User;

    @OneToMany(type => LigneDeFrais, ligne => ligne.note)
    lignes!: LigneDeFrais[];

    @OneToMany(type => Notification, notification => notification.note)
    notifications!: Notification[];
}

export const noteToApi = (note: NoteDeFrais): INoteDeFrais => {
    return {
        id: note.id,
        mois: note.mois,
        annee: note.annee,
        etat: note.etat,
        //user:
        lignes: (note?.lignes ?? []).map(lignes => lineToApi(lignes)),
        notifications: (note?.notifications ?? []).map(notifications => notificationToApi(notifications)),
    };
}