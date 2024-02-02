import { User } from 'src/modules/user/entities/user.entity';
import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'friends' })
export class Friend {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    sender: User;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    receiver: User;

    @CreateDateColumn()
    createdAt: number;
}