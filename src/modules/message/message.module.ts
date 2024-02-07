import { forwardRef, Module } from '@nestjs/common';
import { MessageService } from './services/impl/message.service';
import { ImageStoreModule } from '../image-storage/image-storage.module';
import { MessageAttachmentModule } from '../message-attachment/message-attachment.module';
import { ConversationModule } from '../conversations/conversation.module';
import { FriendModule } from '../friend/friend.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../conversations/entities/conversation.entity';
import { Message } from './entities/message.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/services/impl/auth.service';
import { MessageController } from './controllers/message.controller';
import { Services } from 'src/common/utils/constrants';
import { AuthModule } from '../auth/auth.module';
import { ConversationService } from '../conversations/services/impl/conversation.service';
import { Role } from '../user/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, Message, Conversation]),
        ImageStoreModule,
        MessageAttachmentModule,
        ConversationModule,
        FriendModule,
        JwtModule,
        UserModule
    ],
    controllers: [MessageController],
    providers: [
        {
            provide: Services.AUTH,
            useClass: AuthService,
        },
        {
            provide: Services.MESSAGE,
            useClass: MessageService,
        },
    ],
})
export class MessageModule { }
