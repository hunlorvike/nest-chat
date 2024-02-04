import { FriendRequestController } from './controllers/friend-request.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from '../friend/entities/friend.entity';
import { FriendRequest } from './entities/friend-request.entity';
import { UserModule } from '../user/user.module';
import { FriendModule } from '../friend/friend.module';
import { Services } from 'src/common/utils/constrants';
import { FriendRequestService } from './services/impl/friend-request.service';

@Module({
    imports: [
        UserModule,
        FriendModule,
        TypeOrmModule.forFeature([Friend, FriendRequest]),
    ],
    controllers: [
        FriendRequestController,
    ],
    providers: [
        {
            provide: Services.FRIEND_REQUEST_SERVICE,
            useClass: FriendRequestService,
        },
    ],
})
export class FriendRequestModule { }
