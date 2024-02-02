import { FriendRequestStatus } from 'src/common/utils/types';
import { User } from 'src/modules/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'friend_requests' })
export class FriendRequest {
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

    @Column()
    status: FriendRequestStatus;
}