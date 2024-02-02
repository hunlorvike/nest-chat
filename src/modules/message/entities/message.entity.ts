import { Conversation } from 'src/modules/conversations/entities/conversation.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseMessage } from './base-message.entity';
import { MessageAttachment } from './message-attachment.entity';

@Entity({ name: 'messages' })
export class Message extends BaseMessage {
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @OneToMany(() => MessageAttachment, (attachment) => attachment.message)
  @JoinColumn()
  attachments: MessageAttachment[];
}