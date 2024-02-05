import { UploadImageParams, UploadMessageAttachmentParams, UploadGroupMessageAttachmentParams } from "src/common/utils/types";
import { GroupMessageAttachment } from "src/modules/message-attachment/entities/group-message-attachment.entity";
import { MessageAttachment } from "src/modules/message/entities/message-attachment.entity";

export interface IImageStorageService {
    upload(params: UploadImageParams);
    uploadMessageAttachment(
        params: UploadMessageAttachmentParams,
    ): Promise<MessageAttachment>;
    uploadGroupMessageAttachment(
        params: UploadGroupMessageAttachmentParams,
    ): Promise<GroupMessageAttachment>;
}