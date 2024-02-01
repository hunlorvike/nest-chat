import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Profile } from "./user-profile.entity";
import { UserPresence } from "./user-presence.entity";
import { Role } from "./role.entity";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    username: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column({ unique: true, length: 20, nullable: true })
    phone: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    password: string;

    @Column({ name: 'refresh_token', length: 255, nullable: true })
    refreshToken: string;

    @CreateDateColumn({
        name: 'created_at',
        nullable: true,
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        nullable: true,
    })
    updatedAt: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        nullable: true,
    })
    deletedAt?: Date;

    @OneToOne(() => Profile, { cascade: ['insert', 'update'], nullable: true })
    @JoinColumn()
    profile: Profile;

    @OneToOne(() => UserPresence, { cascade: ['insert', 'update'], nullable: true })
    @JoinColumn()
    presence: UserPresence;

    @ManyToMany(() => Role, { nullable: true })
    @JoinTable({
        name: 'users_roles',
        joinColumn: {
            name: 'userId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'roleId',
            referencedColumnName: 'id',
        },
    })
    roles: Role[];
}
