import { UploadImageParams, UploadMessageAttachmentParams, UploadGroupMessageAttachmentParams } from "src/common/utils/types";
import { GroupMessageAttachment } from "src/modules/message-attachment/entities/group-message-attachment.entity";
import { MessageAttachment } from "src/modules/message/entities/message-attachment.entity";

export interface IImageStorageService {
    upload(params: UploadImageParams): string;

    uploadMessageAttachment(params: UploadMessageAttachmentParams): Promise<MessageAttachment>;

    uploadGroupMessageAttachment(params: UploadGroupMessageAttachmentParams): Promise<GroupMessageAttachment>;

    getFile(key: string): Buffer;

    deleteFile(key: string): void;

    deleteGroupMessageAttachment(params: { key: string, previewKey: string }): Promise<void>;
}
