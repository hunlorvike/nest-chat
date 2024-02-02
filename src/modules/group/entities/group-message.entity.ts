import { BaseMessage } from 'src/modules/message/entities/base-message.entity';
import { MessageAttachment } from 'src/modules/message/entities/message-attachment.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Group } from './group.entity';
import { GroupMessageAttachment } from '../../message-attachment/entities/group-message-attachment.entity';

@Entity({ name: 'group_messages' })
export class GroupMessage extends BaseMessage {
  @ManyToOne(() => Group, (group) => group.messages)
  group: Group;

  @OneToMany(() => GroupMessageAttachment, (attachment) => attachment.message)
  @JoinColumn()
  attachments?: MessageAttachment[];
}