import { Message } from 'src/modules/message/entities/message.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'conversations' })
@Index(['creator.id', 'recipient.id'], { unique: true })
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    creator: User;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    recipient: User;

    @OneToMany(() => Message, (message) => message.conversation, {
        cascade: ['insert', 'remove', 'update'],
    })
    @JoinColumn()
    messages: Message[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: number;

    @OneToOne(() => Message)
    @JoinColumn({ name: 'last_message_sent' })
    lastMessageSent: Message;

    @UpdateDateColumn({ name: 'updated_at' })
    lastMessageSentAt: Date;
}