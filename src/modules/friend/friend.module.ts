/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './entities/friend.entity';
import { FriendsController } from './controllers/friend.controller';
import { Services } from 'src/common/utils/constrants';
import { FriendService } from './services/impl/friend.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AuthService } from '../auth/services/impl/auth.service';
import { Role } from '../user/entities/role.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, Friend]),
        JwtModule,
        UserModule
    ],
    controllers: [FriendsController],
    providers: [
        {
            provide: Services.FRIEND_SERVICE,
            useClass: FriendService
        },
        {
            provide: Services.AUTH,
            useClass: AuthService,
        },
    ],
    exports: [
        {
            provide: Services.FRIEND_SERVICE,
            useClass: FriendService,
        },
    ],

})
export class FriendModule { }
