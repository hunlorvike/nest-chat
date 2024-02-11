import { GroupService } from './services/impl/group.service';
import { GroupController } from './controllers/group.controller';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { GroupMessage } from './entities/group-message.entity';
import { Group } from './entities/group.entity';
import { ImageStoreModule } from '../image-storage/image-storage.module';
import { MessageAttachmentModule } from '../message-attachment/message-attachment.module';
import { GroupMessageController } from './controllers/group-message.controller';
import { GroupRecipientController } from './controllers/group-recipient.controller';
import { GroupMiddleware } from 'src/common/middlewares/group.middleware';
import { isAuthorized } from 'src/common/utils/helpers';
import { Services } from 'src/common/utils/constrants';
import { GroupMessageService } from './services/impl/group-message.service';
import { GroupRecipientService } from './services/impl/group-recipient.service';
import { AuthService } from '../auth/services/impl/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Role } from '../user/entities/role.entity';
import { User } from '../user/entities/user.entity';

@Module({
    imports: [
        UserModule,
        JwtModule,
        MessageAttachmentModule,
        ImageStoreModule,
        TypeOrmModule.forFeature([User, Role, Group, GroupMessage]),
    ],
    controllers: [
        GroupController,
        GroupMessageController,
        GroupRecipientController
    ],
    providers: [
        Logger,
        {
            provide: Services.GROUP,
            useClass: GroupService,
        },
        {
            provide: Services.GROUP_MESSAGE,
            useClass: GroupMessageService,
        },
        {
            provide: Services.GROUP_RECIPIENT,
            useClass: GroupRecipientService,
        },
        {
            provide: Services.AUTH,
            useClass: AuthService,
        },

    ],
    exports: [
        {
            provide: Services.GROUP,
            useClass: GroupService,
        },
    ]
})
export class GroupModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(isAuthorized, GroupMiddleware).forRoutes('groups/:id');
    }
}
