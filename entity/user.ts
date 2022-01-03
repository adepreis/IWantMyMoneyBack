import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export const USER_ROLES = {
    ADMIN: "ADMIN",
    USER: "USER"
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: "varchar"})
    @Index({ unique: true })
    public email!: string;

    @Column({
        type: "enum",
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.USER
    })
    public role!: string;

    @Column({type: "varchar"})
    public password!: string;
}