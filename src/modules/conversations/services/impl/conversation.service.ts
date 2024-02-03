import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IConversationService } from '../interface-conversation.service';
import { AccessParams, CreateConversationParams, GetConversationMessagesParams } from 'src/common/utils/types';
import { User } from 'src/modules/user/entities/user.entity';
import { Message } from 'src/modules/message/entities/message.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Services } from 'src/common/utils/constrants';
import { IUserService } from 'src/modules/user/services/interface-user.service';
import { Messages } from 'src/common/utils/response-message';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationService implements IConversationService {
    constructor(
        @InjectRepository(Conversation) private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
        @Inject(Services.USER) private readonly userService: IUserService,
    ) { }

    async createConversation(user: User, conversationParams: CreateConversationParams) {
        try {
            const { username, message: content } = conversationParams;
            const recipient = await this.userService.findUser({ username });

            if (!recipient) {
                throw new HttpException(Messages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }

            if (user.id === recipient.id) {
                throw new HttpException(Messages.CONFLICT, HttpStatus.CONFLICT);
            }

            const exists = await this.isCreated(user.id, recipient.id);

            if (exists) {
                throw new HttpException(Messages.CONVERSATION_ALREADY_EXISTS, HttpStatus.CONFLICT);
            }

            const newConversation = this.conversationRepository.create({
                creator: user,
                recipient
            });

            const conversation = await this.conversationRepository.save(newConversation);

            // Add any additional logic you want to execute after creating a conversation

        } catch (error) {
            console.error(`${Messages.CREATE_CONVERSATION_ERROR}: ${error.message}`);
            throw error;
        }
    }

    getConversations(user: User): Promise<Conversation[]> {
        return this.conversationRepository
            .createQueryBuilder('conversation')
            .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
            .leftJoinAndSelect('conversation.creator', 'creator')
            .leftJoinAndSelect('conversation.recipient', 'recipient')
            .leftJoinAndSelect('creator.peer', 'creatorPeer')
            .leftJoinAndSelect('recipient.peer', 'recipientPeer')
            .leftJoinAndSelect('creator.profile', 'creatorProfile')
            .leftJoinAndSelect('recipient.profile', 'recipientProfile')
            .andWhere('(creator.id = :id OR recipient.id = :id)', { id: user.id })
            .orderBy('conversation.lastMessageSentAt', 'DESC')
            .getMany();
    }

    findById(id: number): Promise<Conversation> {
        return this.conversationRepository.findOne({
            where: { id },
            relations: [
                'creator',
                'recipient',
                'creator.profile',
                'recipient.profile',
                'lastMessageSend',
            ]
        })
    }

    async hasAccess(params: AccessParams): Promise<boolean> {
        const conversation = await this.findById(params.id);
        if (!conversation) {
            throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);

        }
        return (
            conversation.creator.id === params.userId || conversation.recipient.id === params.userId
        );
    }

    isCreated(userId: number, recipienId: number): Promise<Conversation> {
        return this.conversationRepository.findOne({
            where: [
                {
                    creator: { id: userId },
                    recipient: { id: recipienId },
                },
                {
                    creator: { id: recipienId },
                    recipient: { id: userId },
                }
            ]
        })
    }

    save(conversation: Conversation): Promise<Conversation> {
        return this.conversationRepository.save(conversation);
    }

    async getMessages(params: GetConversationMessagesParams): Promise<Conversation> {
        try {
            const conversation = await this.conversationRepository
                .createQueryBuilder('conversation')
                .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
                .leftJoinAndSelect('conversation.messages', 'message')
                .where('conversation.id = :id', { id: params.id })
                .orderBy('message.createdAt', 'DESC')
                .limit(params.limit)
                .getOne();

            if (!conversation) {
                throw new HttpException(Messages.CONVERSATION_NOT_FOUND, HttpStatus.NOT_FOUND);
            }

            return conversation;
        } catch (error) {
            console.error(`${Messages.GET_MESSAGES_ERROR}: ${error.message}`);
            throw error;
        }
    }

    update(params: Partial<{ id: number; lastMessageSent: Message; }>) {
        return this.conversationRepository.update(params.id, { lastMessageSent: params.lastMessageSent })
    }
}
