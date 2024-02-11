import { Module } from '@nestjs/common';
import { FriendRequestEvent } from './friend-request.event';
import { FriendEvent } from './friend.event';

@Module({
    imports: [],
    controllers: [],
    providers: [FriendRequestEvent, FriendEvent],
})
export class EventModule { }
