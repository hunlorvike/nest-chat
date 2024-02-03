import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Profile } from './user-profile.entity';
import { UserPresence } from './user-presence.entity';
import { Role } from './role.entity';
import { Message } from 'src/modules/message/entities/message.entity';
import { Group } from 'src/modules/group/entities/group.entity';
import { Peer } from './peer.entity';

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

    @OneToMany(() => Message, (message) => message.author)
    @JoinColumn()
    messages: Message[];

    @ManyToMany(() => Group, (group) => group.users)
    groups: Group[];

    @OneToOne(() => Profile, { cascade: ['insert', 'update'], nullable: true })
    @JoinColumn()
    profile: Profile;

    @OneToOne(() => UserPresence, { cascade: ['insert', 'update'], nullable: true })
    @JoinColumn()
    presence: UserPresence;

    @ManyToMany(() => Role, { cascade: true })
    @JoinTable({
        name: 'users_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Role[];

    @OneToOne(() => Peer, (peer) => peer.user, {
        cascade: ['insert', 'remove', 'update'],
    })
    @JoinColumn()
    peer: Peer;
}
