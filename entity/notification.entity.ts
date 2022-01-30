import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NoteDeFrais } from "./notedefrais.entity";
import { User } from "./user.entity";
//ajouter a database.ts la classe 

export interface INotification {
    id: string,
    description: string,
    lu: boolean,
    date: Date
}

@Entity("notification")
export class Notification implements INotification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: "varchar"})
    public description!: string;

    @Column({type: "bool"})
    public lu!: boolean;

    @Column({type: "date"})
    public date!: Date;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => NoteDeFrais)
    note!: NoteDeFrais;
}

export const notificationToApi = (notification: Notification): INotification => {
    return {
        id: notification.id,
        description: notification.description,
        lu: notification.lu,
        date: notification.date
    };
}