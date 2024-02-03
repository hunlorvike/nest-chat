import { MessageAttachment } from '../../message/entities/message-attachment.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { GroupMessageAttachment } from '../../message-attachment/entities/group-message-attachment.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity({ name: 'group_messages' })
export class GroupMessage  {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @ManyToOne(() => User, (user) => user.messages)
  author: User;

  @ManyToOne(() => Group, (group) => group.messages)
  group: Group;

  @OneToMany(() => GroupMessageAttachment, (attachment) => attachment.message)
  @JoinColumn()
  attachments?: MessageAttachment[];
}