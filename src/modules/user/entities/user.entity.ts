import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Profile } from './user-profile.entity';
import { UserPresence } from './user-presence.entity';
import { Role } from './role.entity';
import { Roles } from 'src/common/enums/roles.enum';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true, length: 255 })
    username: string;

    @Column({ unique: true, nullable: true, length: 255 })
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
