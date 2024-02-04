/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTagConfigs, Routes, ServerEvents, Services } from 'src/common/utils/constrants';
import { IFriendRequestService } from '../services/interface-friend-request.service';
import { User } from 'src/modules/user/entities/user.entity';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { CreateFriendDto } from '../dtos/create-friend.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags(ApiTagConfigs.FRIEND_REQUEST)
@ApiBearerAuth()
@Controller(Routes.FRIEND_REQUEST)
export class FriendRequestController {
    constructor(
        @Inject(Services.FRIEND_REQUEST_SERVICE)
        private readonly friendRequestService: IFriendRequestService,
        private event: EventEmitter2,
    ) { }

    @Get()
    getFriendRequests(@GetUser() user: User) {
        console.log(user);
        return this.friendRequestService.getFriendRequests(user.id);
    }

    @Post()
    async createFriendRequest(
        @GetUser() user: User,
        @Body() { username }: CreateFriendDto,
    ) {
        const params = { user, username };
        const friendRequest = await this.friendRequestService.create(params);
        this.event.emit('friendrequest.create', friendRequest);
        return friendRequest;
    }

    @Patch(':id/accept')
    async acceptFriendRequest(
        @GetUser() { id: userId }: User,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const response = await this.friendRequestService.accept({ id, userId });
        this.event.emit(ServerEvents.FRIEND_REQUEST_ACCEPTED, response);
        return response;
    }

    @Delete(':id/cancel')
    async cancelFriendRequest(
        @GetUser() { id: userId }: User,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const response = await this.friendRequestService.cancel({ id, userId });
        this.event.emit('friendrequest.cancel', response);
        return response;
    }

    @Patch(':id/reject')
    async rejectFriendRequest(
        @GetUser() { id: userId }: User,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const response = await this.friendRequestService.reject({ id, userId });
        this.event.emit(ServerEvents.FRIEND_REQUEST_REJECTED, response);
        return response;
    }

}
