import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
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
}