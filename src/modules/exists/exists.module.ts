/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ConversationModule } from '../conversations/conversation.module';
import { UserModule } from '../user/user.module';
import { ExistsController } from './exists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from 'src/common/utils/constrants';
import { AuthService } from '../auth/services/impl/auth.service';
import { Conversation } from '../conversations/entities/conversation.entity';
import { Role } from '../user/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        ConversationModule,
        UserModule,
        TypeOrmModule.forFeature([User, Role, Conversation]),
        JwtModule
    ],
    controllers: [ExistsController],
    providers: [
        {
            provide: Services.AUTH,
            useClass: AuthService,
        },
    ],
})
export class ExistsModule { }
