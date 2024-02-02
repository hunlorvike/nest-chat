import { AccessParams, CreateConversationParams, GetConversationMessagesParams, UpdateConversationParams } from "src/common/utils/types";
import { User } from "src/modules/user/entities/user.entity";
import { Conversation } from "../entities/conversation.entity";

export interface IConversationService {
    createConversation(user: User, conversationParams: CreateConversationParams);
    getConversations(user: User): Promise<Conversation[]>;
    findById(id: number): Promise<Conversation | undefined>;
    hasAccess(params: AccessParams): Promise<boolean>;
    isCreated(userId: number, recipienId: number): Promise<Conversation | undefined>;
    save(conversation: Conversation): Promise<Conversation>;
    getMessages(params: GetConversationMessagesParams): Promise<Conversation>;
    update(params: UpdateConversationParams);
}