import {
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';
import { Routes, ServerEvents, Services } from 'src/common/utils/constrants';
import { User } from 'src/modules/user/entities/user.entity';
import { IFriendService } from '../services/interface-friend.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@SkipThrottle()
@Controller(Routes.FRIEND)
export class FriendsController {
    constructor(
        @Inject(Services.FRIENDS_SERVICE) private readonly friendsService: IFriendService,
		private readonly events: EventEmitter2,
    ) { }

    @Get()
    getFriends(@GetUser() user: User) {
        console.log('Fetching Friends');
        return this.friendsService.getFriends(user.id);
    }

    @Delete(':id/delete')
    async deleteFriend(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const friend = await this.friendsService.deleteFriend({ id, userId: user.id });
        this.events.emit(ServerEvents.FRIEND_REMOVED, { friend, userId: user.id });
        return friend;
    }
}