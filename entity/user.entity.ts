import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Avance } from "./avance.entity";
import { ChefAnterieur } from "./chefanterieur.entity";
import { NoteDeFrais } from "./notedefrais.entity";
import { Notification } from "./notification.entity";
import { Service } from "./service.entity";
import { CollaborateurAnterieur } from "./collaborateuranterieur.entity";
import { USER_ROLES } from "./utils";
//ajouter a database.ts la classe 

export interface IUser {
    id: string,
    email: string,
    nom: string,
    prenom: string,
}

@Entity("user")
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
/*
    @Column({type: "varchar"})
    @Index({ unique: true })
    public login!: string;
*/
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

    @OneToMany(type => User, collaborateurs => collaborateurs.chef)
    collaborateurs!: User[];

    @ManyToOne(type => User, user => user.collaborateurs)
    chef!: User;


    @OneToMany(type => CollaborateurAnterieur, collaborateurAnterieurs => collaborateurAnterieurs.collaborateur)
    collaborateurAnterieur!: CollaborateurAnterieur[];

    @OneToMany(type => ChefAnterieur, chefAnterieurs => chefAnterieurs.chefAnterieur)
    chefsAnterieurs!: ChefAnterieur[];
}

export const userToApi = (user: User): IUser => {
    return {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
    }
}