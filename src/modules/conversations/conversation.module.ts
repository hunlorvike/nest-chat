import { ConversationService } from './services/impl/conversation.service';
import { ConversationController } from './controllers/conversation.controller';
import { Module } from '@nestjs/common';
import { Services } from 'src/common/utils/constrants';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../user/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { AuthService } from '../auth/services/impl/auth.service';
import { Conversation } from './entities/conversation.entity';

@Module({
    imports: [
        UserModule,
        JwtModule,
        TypeOrmModule.forFeature([User, Role, Conversation])

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
})
export class ConversationModule { }
