import { Inject, Injectable, Logger } from "@nestjs/common";
import { IMessageService } from "../interface-message.service";
import { CreateMessageParams, CreateMessageResponse, DeleteMessageParams, EditMessageParams } from "src/common/utils/types";
import { Message } from "../../entities/message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Services } from "src/common/utils/constrants";
import { IConversationService } from "src/modules/conversations/services/interface-conversation.service";
import { IFriendService } from "src/modules/friend/services/interface-friend.service";
import { IMessageAttachmentsService } from "src/modules/message-attachment/services/interface-message-attachment.service";
import { instanceToPlain } from "class-transformer";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Conversation } from "src/modules/conversations/entities/conversation.entity";
import { buildFindMessageParams } from "src/common/utils/builder";

@Injectable()
export class MessageService implements IMessageService {
    constructor(
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
        @Inject(Services.CONVERSATION) private readonly conversationService: IConversationService,
        @Inject(Services.MESSAGE_ATTACHMENT) private readonly messageAttachmentService: IMessageAttachmentsService,
        @Inject(Services.FRIEND_SERVICE) private readonly friendService: IFriendService,
        private readonly logger: Logger,
    ) { }

    async createMessage(params: CreateMessageParams) {
        try {
            const { user, content, id } = params;
            const conversation = await this.conversationService.findById(id);

            if (!conversation) {
                throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
            }

            const { creator, recipient } = conversation;
            const isFriends = await this.friendService.isFriends(
                creator.id,
                recipient.id,
            );

            if (!isFriends) {
                throw new HttpException('Users are not friends', HttpStatus.FORBIDDEN);
            }

            if (creator.id !== user.id && recipient.id !== user.id) {
                throw new HttpException('Cannot create message for this conversation', HttpStatus.FORBIDDEN);
            }

            const message = this.messageRepository.create({
                content,
                conversation,
                author: instanceToPlain(user),
                attachments: params.attachments
                    ? await this.messageAttachmentService.create(params.attachments)
                    : [],
            });

            const savedMessage = await this.messageRepository.save(message);

            conversation.lastMessageSent = savedMessage;
            const updated = await this.conversationService.save(conversation);

            return { message: savedMessage, conversation: updated };
        } catch (error) {
            this.logger.error(`Error in create message: ${error.message}`, error.stack, 'MessageService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getMessages(conversationId: number): Promise<Message[]> {
        try {
            const messages = await this.messageRepository
                .createQueryBuilder('message')
                .select(['message.id', 'message.content', 'message.createdAt'])
                .leftJoinAndSelect('message.author', 'author')
                .where('message.conversationId = :conversationId', { conversationId })
                .orderBy('message.createdAt', 'DESC')
                .getMany();

            return messages.map((message) => {
                return {
                    id: message.id,
                    content: message.content,
                    createdAt: message.createdAt,
                    author: this.processUser(message.author),
                } as Message;
            });
        } catch (error) {
            this.logger.error(`Error in get messages: ${error.message}`, error.stack, 'MessageService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteMessage(params: DeleteMessageParams) {
        try {
            const { conversationId } = params;
            const msgParams = { id: conversationId, limit: 5 };
            const conversation = await this.conversationService.getMessages(msgParams);
            if (!conversation) {
                throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
            }
            const findMessageParams = buildFindMessageParams(params);
            const message = await this.messageRepository.findOne(findMessageParams);
            if (!message) {
                throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
            }
            if (conversation.lastMessageSent.id !== message.id)
                return this.messageRepository.delete({ id: message.id });
            return this.deleteLastMessage(conversation, message);
        } catch (error) {
            this.logger.error(`Error in delete message: ${error.message}`, error.stack, 'MessageService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteLastMessage(conversation: Conversation, message: Message) {
        try {
            const size = conversation.messages.length;
            const SECOND_MESSAGE_INDEX = 1;
            if (size <= 1) {
                console.log('Last Message Sent is deleted');
                await this.conversationService.update({
                    id: conversation.id,
                    lastMessageSent: null,
                });
                return this.messageRepository.delete({ id: message.id });
            } else {
                console.log('There are more than 1 message');
                const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];
                await this.conversationService.update({
                    id: conversation.id,
                    lastMessageSent: newLastMessage,
                });
                return this.messageRepository.delete({ id: message.id });
            }
        } catch (error) {
            this.logger.error(`Error in delete last message: ${error.message}`, error.stack, 'MessageService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editMessage(params: EditMessageParams) {
        try {
            const messageDB = await this.messageRepository.findOne({
                where: {
                    id: params.messageId,
                    author: { id: params.userId },
                },
                relations: [
                    'conversation',
                    'conversation.creator',
                    'conversation.recipient',
                    'author',
                    'author.profile',
                ],
            });

            if (!messageDB) {
                throw new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST);
            }

            messageDB.content = params.content;

            const updatedMessage = await this.messageRepository.save(messageDB);

            return {
                id: updatedMessage.id,
                content: updatedMessage.content,
                createdAt: updatedMessage.createdAt,
                author: this.processUser(updatedMessage.author),
                conversation: {
                    id: updatedMessage.conversation.id,
                    createdAt: updatedMessage.conversation.createdAt,
                    lastMessageSentAt: updatedMessage.conversation.lastMessageSentAt,
                    creator: this.processUser(updatedMessage.conversation.creator),
                    recipient: this.processUser(updatedMessage.conversation.recipient),
                },
            } as Message;
        } catch (error) {
            this.logger.error(`Error in edit message: ${error.message}`, error.stack, 'MessageService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    private processUser(user: any): any {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
}
