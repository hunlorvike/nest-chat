import { CreateMessageParams, CreateMessageResponse, DeleteMessageParams, EditMessageParams } from "src/common/utils/types";
import { Message } from "../entities/message.entity";

export interface IMessageService {
    createMessage(params: CreateMessageParams): Promise<CreateMessageResponse>;
    getMessages(id: number): Promise<Message[]>;
    deleteMessage(params: DeleteMessageParams);
    editMessage(params: EditMessageParams): Promise<Message>;
}