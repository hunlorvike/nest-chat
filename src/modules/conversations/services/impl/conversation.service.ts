import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IConversationService } from '../interface-conversation.service';
import { AccessParams, CreateConversationParams, GetConversationMessagesParams } from 'src/common/utils/types';
import { User } from 'src/modules/user/entities/user.entity';
import { Message } from 'src/modules/message/entities/message.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Services } from 'src/common/utils/constrants';
import { IUserService } from 'src/modules/user/services/interface-user.service';
import { Messages } from 'src/common/utils/response-message';

@Injectable()
export class ConversationService implements IConversationService {
    constructor(
        @Inject(Services.USER)
        private readonly userService: IUserService,
    ) { }

    async createConversation(user: User, conversationParams: CreateConversationParams) {
        const { username, message: content } = conversationParams;
        const recipient = await this.userService.findUser({ username });
        if (!recipient) {
            throw new HttpException(Messages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        if (user.id === recipient.id) {
            throw new HttpException("Cannot create conversation with yourself", HttpStatus.CONFLICT);
        }

    }   
    getConversations(user: User): Promise<Conversation[]> {
        throw new Error('Method not implemented.');
    }
    findById(id: number): Promise<Conversation> {
        throw new Error('Method not implemented.');
    }
    hasAccess(params: AccessParams): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isCreated(userId: number, recipienId: number): Promise<Conversation> {
        throw new Error('Method not implemented.');
    }
    save(conversation: Conversation): Promise<Conversation> {
        throw new Error('Method not implemented.');
    }
    getMessages(params: GetConversationMessagesParams): Promise<Conversation> {
        throw new Error('Method not implemented.');
    }
    update(params: Partial<{ id: number; lastMessageSent: Message; }>) {
        throw new Error('Method not implemented.');
    }
}
