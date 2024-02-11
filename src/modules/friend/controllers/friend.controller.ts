import {
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    UseGuards,
    Logger,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags, ApiOkResponse, ApiNoContentResponse, ApiParam, ApiNotFoundResponse } from '@nestjs/swagger';
import { ApiTagConfigs, Routes, ServerEvents, Services } from 'src/common/utils/constrants';
import { User } from 'src/modules/user/entities/user.entity';
import { IFriendService } from '../services/interface-friend.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiTags(ApiTagConfigs.FRIEND)
@ApiBearerAuth()
@SkipThrottle()
@Controller(Routes.FRIEND)
@UseGuards(JwtGuard)
@Roles()
export class FriendsController {
    constructor(
        @Inject(Services.FRIEND_SERVICE) private readonly friendService: IFriendService,
        private readonly events: EventEmitter2,
        private readonly logger: Logger, 
    ) { }

    @Get()
    @ApiOkResponse({ description: 'Returns a list of friends for the authenticated user' })
    async getFriends(@GetUser() user: User) {
        try {
            const data = await this.friendService.getFriends(user.id);
            return { data };
        } catch (error) {
            this.logger.error(`Error in getFriends: ${error.message}`, error.stack, 'FriendsController');
            throw error;
        }
    }

    @Delete(':id/delete')
    @ApiParam({ name: 'id', description: 'Friend ID to delete', type: 'integer' })
    @ApiOkResponse({ description: 'Deletes a friend and emits a FRIEND_REMOVED event' })
    @ApiNoContentResponse({ description: 'Friend successfully removed' })
    @ApiNotFoundResponse({ description: 'Friend not found' })
    async deleteFriend(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            const friend = await this.friendService.deleteFriend({ id, userId: user.id });

            if (!friend) {
                throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);
            }

            this.events.emit(ServerEvents.FRIEND_REMOVED, { friend, userId: user.id });
            return friend;
        } catch (error) {
            this.logger.error(`Error in deleteFriend: ${error.message}`, error.stack, 'FriendsController');
            throw error;
        }
    }
}
