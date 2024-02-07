import { ConversationService } from './services/impl/conversation.service';
import { ConversationController } from './controllers/conversation.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Services } from 'src/common/utils/constrants';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../user/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { AuthService } from '../auth/services/impl/auth.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from '../message/entities/message.entity';
import { FriendModule } from '../friend/friend.module';
import { isAuthorized } from 'src/common/utils/helpers';
import { ConversationMiddleware } from './middlewares/conversation.middleware';

@Module({
    imports: [
        UserModule,
        JwtModule,
        FriendModule,
        TypeOrmModule.forFeature([User, Role, Conversation, Message])
    ],
    controllers: [
        ConversationController
    ],
    providers: [
        {
            provide: Services.CONVERSATION,
            useClass: ConversationService
        },
        {
            provide: Services.AUTH,
            useClass: AuthService,
        },
    ],
    exports: [
        {
            provide: Services.CONVERSATION,
            useClass: ConversationService
        },
    ]
})
export class ConversationModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(isAuthorized, ConversationMiddleware)
        .forRoutes('conversation/:id')
    } 

}
