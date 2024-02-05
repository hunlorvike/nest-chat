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
    
    create(attachments: Attachment[]): Promise<MessageAttachment[]> {
        throw new Error("Method not implemented.");
    }

    createGroupAttachments(attachments: Attachment[]): Promise<GroupMessageAttachment[]> {
        throw new Error("Method not implemented.");
    }

    deleteAllAttachments(attachments: MessageAttachment[]) {
        throw new Error("Method not implemented.");
    }

}