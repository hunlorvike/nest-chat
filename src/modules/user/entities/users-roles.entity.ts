import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity({ name: 'users_roles' })
export class User_Role {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.roles)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'roleId' })
    role: Role;
}
