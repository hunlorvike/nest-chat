import { Message } from "src/modules/message/entities/message.entity";
import { FindOneOptions } from "typeorm";
import { FindMessageParams } from "./types";

export const buildFindMessageParams = (params: FindMessageParams): FindOneOptions<Message> => ({
    where: {
        id: params.messageId,
        author: { id: params.userId },
        conversation: { id: params.conversationId },
    },
});
