import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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
    ligne: ILigneDeFrais[],
    notification: INotification[]
}

@Entity("notedefrais")
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
    ligne!: LigneDeFrais[];

    @OneToMany(type => Notification, notification => notification.note)
    notification!: Notification[];
}

export const noteToApi = (note: NoteDeFrais): INoteDeFrais => {
    return {
        id: note.id,
        mois: note.mois,
        annee: note.annee,
        etat: note.etat,
        ligne: (note?.ligne ?? []).map(ligne => lineToApi(ligne)),
        notification: (note?.notification ?? []).map(notification => notificationToApi(notification)),
    };
}