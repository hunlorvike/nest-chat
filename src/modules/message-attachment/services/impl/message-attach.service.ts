import { Inject, Injectable, Logger } from "@nestjs/common";
import { IMessageAttachmentsService } from "../interface-message-attachment.service";
import { Attachment } from "src/common/utils/types";
import { MessageAttachment } from "src/modules/message/entities/message-attachment.entity";
import { GroupMessageAttachment } from "../../entities/group-message-attachment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Services } from "src/common/utils/constrants";
import { Repository } from "typeorm";
import { IImageStorageService } from "src/modules/image-storage/services/interface-image-storage.service";
import { HttpException, HttpStatus } from "@nestjs/common";

@Injectable()
export class MessageAttachmentService implements IMessageAttachmentsService {

    constructor(
        @InjectRepository(MessageAttachment) private readonly attachmentRepository: Repository<MessageAttachment>,
        @InjectRepository(GroupMessageAttachment) private readonly groupAttachmentRepository: Repository<GroupMessageAttachment>,
        @Inject(Services.IMAGE_UPLOAD_SERVICE) private readonly imageUploadService: IImageStorageService,
        private readonly logger: Logger,
    ) { }

    async create(attachments: Attachment[]) {
        try {
            const promise = attachments.map(async (attachment) => {
                const newAttachment = this.attachmentRepository.create();
                const savedAttachment = await this.attachmentRepository.save(newAttachment);
                await this.imageUploadService.uploadMessageAttachment({
                    messageAttachment: savedAttachment,
                    file: attachment,
                });
                return savedAttachment;
            });
            return Promise.all(promise);
        } catch (error) {
            this.logger.error(`Error in create attachments: ${error.message}`, error.stack, 'MessageAttachmentService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createGroupAttachments(attachments: Attachment[]): Promise<GroupMessageAttachment[]> {
        try {
            const promise = attachments.map(async (attachment) => {
                const newAttachment = this.groupAttachmentRepository.create();
                const savedAttachment = await this.groupAttachmentRepository.save(newAttachment);
                await this.imageUploadService.uploadGroupMessageAttachment({
                    messageAttachment: savedAttachment,
                    file: attachment,
                });
                return savedAttachment;
            });
            return Promise.all(promise);
        } catch (error) {
            this.logger.error(`Error in create group attachments: ${error.message}`, error.stack, 'MessageAttachmentService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteAllAttachments(attachments: MessageAttachment[]) {
        try {
            const promise = attachments.map((attachment) =>
                this.attachmentRepository.delete(attachment.key),
            );
            await Promise.all(promise);
        } catch (error) {
            this.logger.error(`Error in delete attachments: ${error.message}`, error.stack, 'MessageAttachmentService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
