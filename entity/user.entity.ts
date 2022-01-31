import { Column, Entity, Index, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Avance } from "./avance.entity";
import { NoteDeFrais } from "./notedefrais.entity";
import { Notification } from "./notification.entity";
import { Service } from "./service.entity";
//ajouter a database.ts la classe 
export const USER_ROLES = {
    ADMIN: "ADMIN",
    USER: "USER"
}

@Entity("user")
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: "varchar"})
    @Index({ unique: true })
    public login!: string;

    @Column({type: "varchar"})
    public password!: string;

    @Column({type: "varchar"})
    @Index({ unique: true })
    public email!: string;

    @Column({type: "varchar"})
    public nom!: string;

    @Column({type: "varchar"})
    public prenom!: string;

    @Column({
        type: "enum",
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.USER
    })
    public role!: string;

    @OneToMany(type => Notification, notifications => notifications.user)
    notifications!: Notification[];

    @OneToMany(type => NoteDeFrais, notes => notes.user)
    notes!: NoteDeFrais[];

    @OneToMany(type => Avance, avances => avances.user)
    avances!: Avance[];

    // ManyToOne ChefDeService (user)
    // ManyToMany services
    // ManyToMany chefAnterieurs
}