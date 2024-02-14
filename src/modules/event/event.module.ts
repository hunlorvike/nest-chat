import { Module } from '@nestjs/common';
import { FriendRequestEvent } from './friend-request.event';
import { FriendEvent } from './friend.event';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [GatewayModule],
    providers: [FriendRequestEvent, FriendEvent],
})
export class EventModule { }
