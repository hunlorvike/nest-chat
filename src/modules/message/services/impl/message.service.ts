import { Inject, Injectable } from "@nestjs/common";
import { IMessageService } from "../interface-message.service";
import { CreateMessageParams, CreateMessageResponse, DeleteMessageParams, EditMessageParams } from "src/common/utils/types";
import { Message } from "../../entities/message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Services } from "src/common/utils/constrants";
import { IConversationService } from "src/modules/conversations/services/interface-conversation.service";
import { IFriendService } from "src/modules/friend/services/interface-friend.service";

@Injectable()
export class MessageService implements IMessageService {
    constructor(
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
        @Inject(Services.CONVERSATION) private readonly conversationService: IConversationService,
        // @Inject(Services.MESSAGE_ATTACHMENT) private readonly messageAttachmentService : IMessageAttachmentService,
        @Inject(Services.FRIEND_SERVICE) private readonly friendService: IFriendService
    ) { }
    
    createMessage(params: CreateMessageParams): Promise<CreateMessageResponse> {
        throw new Error("Method not implemented.");
    }

    getMessages(id: number): Promise<Message[]> {
        throw new Error("Method not implemented.");
    }

    deleteMessage(params: DeleteMessageParams) {
        throw new Error("Method not implemented.");
    }

    editMessage(params: EditMessageParams): Promise<Message> {
        throw new Error("Method not implemented.");
    }
}