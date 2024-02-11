/*
https://docs.nestjs.com/modules
*/

import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageAttachment } from '../message/entities/message-attachment.entity';
import { GroupMessageAttachment } from './entities/group-message-attachment.entity';
import { ImageStoreModule } from '../image-storage/image-storage.module';
import { Services } from 'src/common/utils/constrants';
import { MessageAttachmentService } from './services/impl/message-attach.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([MessageAttachment, GroupMessageAttachment]),
        ImageStoreModule
    ],
    providers: [
        Logger,
        {
            provide: Services.MESSAGE_ATTACHMENT,
            useClass: MessageAttachmentService,
        },
    ],
    exports: [
        {
            provide: Services.MESSAGE_ATTACHMENT,
            useClass: MessageAttachmentService,
        },
    ],
})
export class MessageAttachmentModule { }
