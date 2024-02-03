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

@Module({
    imports: [
        TypeOrmModule.forFeature([Friend]),
    ],
    controllers: [FriendsController],
    providers: [
        {
            provide: Services.FRIENDS_SERVICE,
            useClass: FriendService
        }
    ],
    exports: [
        {
            provide: Services.FRIENDS_SERVICE,
            useClass: FriendService,
        },
    ],

})
export class FriendModule { }
