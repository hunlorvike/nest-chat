import { FriendRequestController } from './controllers/friend-request.controller';
/*
https://docs.nestjs.com/modules
*/

import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from '../friend/entities/friend.entity';
import { FriendRequest } from './entities/friend-request.entity';
import { UserModule } from '../user/user.module';
import { FriendModule } from '../friend/friend.module';
import { Services } from 'src/common/utils/constrants';
import { FriendRequestService } from './services/impl/friend-request.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/services/impl/auth.service';
import { Role } from '../user/entities/role.entity';
import { User } from '../user/entities/user.entity';

@Module({
    imports: [
        UserModule,
        FriendModule,
        JwtModule,
        TypeOrmModule.forFeature([User, Role, Friend, FriendRequest]),
    ],
    controllers: [
        FriendRequestController,
    ],
    providers: [
        Logger,
        {
            provide: Services.FRIEND_REQUEST_SERVICE,
            useClass: FriendRequestService,
        },
        {
            provide: Services.AUTH,
            useClass: AuthService,
        },
    ],
})
export class FriendRequestModule { }
