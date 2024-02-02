import { User } from 'src/modules/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class BaseMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text', { nullable: true })
    content: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: number;

    @ManyToOne(() => User, (user) => user.messages)
    author: User;
}