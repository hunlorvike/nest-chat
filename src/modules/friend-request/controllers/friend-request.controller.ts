import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiParam, ApiNoContentResponse } from '@nestjs/swagger'; // Import Swagger decorators
import { ApiTagConfigs, Routes, ServerEvents, Services } from 'src/common/utils/constrants';
import { IFriendRequestService } from '../services/interface-friend-request.service';
import { User } from 'src/modules/user/entities/user.entity';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { CreateFriendDto } from '../dtos/create-friend.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';

@ApiTags(ApiTagConfigs.FRIEND_REQUEST)
@ApiBearerAuth()
@Controller(Routes.FRIEND_REQUEST)
@UseGuards(JwtGuard)
@Roles()
export class FriendRequestController {
  constructor(
    @Inject(Services.FRIEND_REQUEST_SERVICE)
    private readonly friendRequestService: IFriendRequestService,
    private event: EventEmitter2,
  ) { }

  @Get()
  @ApiOkResponse({ description: 'Returns a list of friend requests for the authenticated user' })
  getFriendRequests(@GetUser() user: User) {
    return this.friendRequestService.getFriendRequests(user.id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Creates a friend request and emits a friendrequest.create event' })
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
  @ApiParam({ name: 'id', description: 'Friend Request ID to accept', type: 'integer' })
  @ApiOkResponse({ description: 'Accepts a friend request and emits a FRIEND_REQUEST_ACCEPTED event' })
  async acceptFriendRequest(
    @GetUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const response = await this.friendRequestService.accept({ id, userId });
    this.event.emit(ServerEvents.FRIEND_REQUEST_ACCEPTED, response);
    return response;
  }

  @Delete(':id/cancel')
  @ApiParam({ name: 'id', description: 'Friend Request ID to cancel', type: 'integer' })
  @ApiOkResponse({ description: 'Cancels a friend request and emits a friendrequest.cancel event' })
  async cancelFriendRequest(
    @GetUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const response = await this.friendRequestService.cancel({ id, userId });
    this.event.emit('friendrequest.cancel', response);
    return response;
  }

  @Patch(':id/reject')
  @ApiParam({ name: 'id', description: 'Friend Request ID to reject', type: 'integer' })
  @ApiNoContentResponse({ description: 'Rejects a friend request and emits a FRIEND_REQUEST_REJECTED event' })
  async rejectFriendRequest(
    @GetUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const response = await this.friendRequestService.reject({ id, userId });
    this.event.emit(ServerEvents.FRIEND_REQUEST_REJECTED, response);
    return response;
  }
}
