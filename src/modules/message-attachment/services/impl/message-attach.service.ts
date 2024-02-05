import { Inject, Injectable } from "@nestjs/common";
import { IMessageAttachmentsService } from "../interface-message-attachment.service";
import { Attachment } from "src/common/utils/types";
import { MessageAttachment } from "src/modules/message/entities/message-attachment.entity";
import { GroupMessageAttachment } from "../../entities/group-message-attachment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Services } from "src/common/utils/constrants";
import { Repository } from "typeorm";
import { IImageStorageService } from "src/modules/image-storage/services/interface-image-storage.service";

@Injectable()
export class MessageAttachmentService implements IMessageAttachmentsService {

    constructor(
        @InjectRepository(MessageAttachment) private readonly attachmentRepository: Repository<MessageAttachment>,
        @InjectRepository(GroupMessageAttachment) private readonly groupAttachmentRepository: Repository<GroupMessageAttachment>,
        @Inject(Services.IMAGE_UPLOAD_SERVICE) private readonly imageUploadService: IImageStorageService,
    ) { }

    create(attachments: Attachment[]) {
        const promise = attachments.map((attachment) => {
            const newAttachment = this.attachmentRepository.create();
            return this.attachmentRepository
                .save(newAttachment)
                .then((messageAttachment) =>
                    this.imageUploadService.uploadMessageAttachment({
                        messageAttachment,
                        file: attachment,
                    }),
                );
        });
        return Promise.all(promise);
    }

    createGroupAttachments(
        attachments: Attachment[],
    ): Promise<GroupMessageAttachment[]> {
        const promise = attachments.map((attachment) => {
            const newAttachment = this.groupAttachmentRepository.create();
            return this.groupAttachmentRepository
                .save(newAttachment)
                .then((messageAttachment) =>
                    this.imageUploadService.uploadGroupMessageAttachment({
                        messageAttachment,
                        file: attachment,
                    }),
                );
        });
        return Promise.all(promise);
    }

    deleteAllAttachments(attachments: MessageAttachment[]) {
        const promise = attachments.map((attachment) =>
            this.attachmentRepository.delete(attachment.key),
        );
        return Promise.all(promise);
    }

}