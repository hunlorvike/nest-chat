import { Inject, Injectable } from "@nestjs/common";
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
        @Inject(Services.FRIEND_SERVICE) private readonly friendService: IFriendService
    ) { }

    async createMessage(params: CreateMessageParams) {
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
    }

    getMessages(conversationId: number): Promise<Message[]> {
        return this.messageRepository.find({
            relations: ['author', 'attachments', 'author.profile'],
            where: { conversation: { id: conversationId } },
            order: { createdAt: 'DESC' },
        });
    }

    async deleteMessage(params: DeleteMessageParams) {
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
    }

    async deleteLastMessage(conversation: Conversation, message: Message) {
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
    }

    async editMessage(params: EditMessageParams) {
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
        if (!messageDB)
            throw new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST);
        messageDB.content = params.content;
        return this.messageRepository.save(messageDB);
    }
}