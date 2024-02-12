import { Body, Controller, Delete, ExecutionContext, Get, Inject, Param, ParseIntPipe, Patch, Post, UseGuards, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiParam, ApiNoContentResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { ApiTagConfigs, Routes, ServerEvents, Services } from 'src/common/utils/constrants';
import { IFriendRequestService } from '../services/interface-friend-request.service';
import { User } from 'src/modules/user/entities/user.entity';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { CreateFriendDto } from '../dtos/create-friend.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

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
		private readonly logger: Logger,
	) { }

	@Get()
	@ApiOkResponse({ description: 'Returns a list of friend requests for the authenticated user' })
	async getFriendRequests(@GetUser() user: User) {
		try {
			return this.friendRequestService.getFriendRequests(user.id);
		} catch (error) {
			this.logger.error(`Error in getFriendRequests: ${error.message}`, error.stack, 'FriendRequestController');
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Throttle({ default: { limit: 3, ttl: 10 } })
	@Post()
	@ApiCreatedResponse({ description: 'Creates a friend request and emits a friendrequest.create event' })
	async createFriendRequest(
		@GetUser() user: User,
		@Body() { username }: CreateFriendDto,
	) {
		try {
			const params = { user, username };
			const friendRequest = await this.friendRequestService.create(params);
			this.event.emit('friendrequest.create', friendRequest);
			return friendRequest;
		} catch (error) {
			this.logger.error(`Error in createFriendRequest: ${error.message}`, error.stack, 'FriendRequestController');
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Throttle({ default: { limit: 3, ttl: 10 } })
	@Patch(':id/accept')
	@ApiParam({ name: 'id', description: 'Friend Request ID to accept', type: 'integer' })
	@ApiOkResponse({ description: 'Accepts a friend request and emits a FRIEND_REQUEST_ACCEPTED event' })
	async acceptFriendRequest(
		@GetUser() { id: userId }: User,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const response = await this.friendRequestService.accept({ id, userId });
			this.event.emit(ServerEvents.FRIEND_REQUEST_ACCEPTED, response);
			return response;
		} catch (error) {
			this.logger.error(`Error in acceptFriendRequest: ${error.message}`, error.stack, 'FriendRequestController');
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Throttle({ default: { limit: 3, ttl: 10 } })
	@Delete(':id/cancel')
	@ApiParam({ name: 'id', description: 'Friend Request ID to cancel', type: 'integer' })
	@ApiOkResponse({ description: 'Cancels a friend request and emits a friendrequest.cancel event' })
	async cancelFriendRequest(
		@GetUser() { id: userId }: User,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const response = await this.friendRequestService.cancel({ id, userId });
			this.event.emit('friendrequest.cancel', response);
			return response;
		} catch (error) {
			this.logger.error(`Error in cancelFriendRequest: ${error.message}`, error.stack, 'FriendRequestController');
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Throttle({ default: { limit: 3, ttl: 10 } })
	@Patch(':id/reject')
	@ApiParam({ name: 'id', description: 'Friend Request ID to reject', type: 'integer' })
	@ApiNoContentResponse({ description: 'Rejects a friend request and emits a FRIEND_REQUEST_REJECTED event' })
	async rejectFriendRequest(
		@GetUser() { id: userId }: User,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const response = await this.friendRequestService.reject({ id, userId });
			this.event.emit(ServerEvents.FRIEND_REQUEST_REJECTED, response);
			return response;
		} catch (error) {
			this.logger.error(`Error in rejectFriendRequest: ${error.message}`, error.stack, 'FriendRequestController');
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
