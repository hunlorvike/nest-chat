import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Roles } from 'src/common/enums/roles.enum';

@Entity({ name: "roles" })
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: Roles, default: Roles.USER })
    name: Roles;

    @ManyToMany(() => User, user => user.roles)
    users: User[];
}
