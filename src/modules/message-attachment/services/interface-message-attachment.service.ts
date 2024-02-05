import { Attachment } from "src/common/utils/types";
import { MessageAttachment } from "src/modules/message/entities/message-attachment.entity";
import { GroupMessageAttachment } from "../entities/group-message-attachment.entity";

export interface IMessageAttachmentsService {
    create(attachments: Attachment[]): Promise<MessageAttachment[]>;
    createGroupAttachments(
        attachments: Attachment[],
    ): Promise<GroupMessageAttachment[]>;
    deleteAllAttachments(attachments: MessageAttachment[]);
}