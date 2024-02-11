import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { Attachment } from 'src/common/utils/types';
import { User } from 'src/modules/user/entities/user.entity';
import { IGroupService } from '../services/interface-group.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { TransferOwnerDto } from '../dtos/transfer-owner.dto';
import { UpdateGroupDetailsDto } from '../dtos/update-group-detail';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiTags(ApiTagConfigs.GROUP)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Roles()
@Controller(Routes.GROUP)
export class GroupController {
	constructor(
		@Inject(Services.GROUP) private readonly groupService: IGroupService,
		private readonly eventEmitter: EventEmitter2,
		private readonly logger: Logger, 
	) { }

	@Post()
	async createGroup(@GetUser() user: User, @Body() payload: CreateGroupDto) {
		try {
			const group = await this.groupService.createGroup({
				...payload,
				creator: user,
			});
			this.eventEmitter.emit('group.create', group);
			return group;
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			this.logger.error(`Error in create group: ${error.message}`, error.stack, 'GroupController');
			throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Get()
	getGroups(@GetUser() user: User) {
		try {
			return this.groupService.getGroups({ userId: user.id });
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			this.logger.error(`Error in get groups: ${error.message}`, error.stack, 'GroupController');
			throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Get(':id')
	getGroup(@GetUser() user: User, @Param('id') id: number) {
		try {
			return this.groupService.findGroupById(id);
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			this.logger.error(`Error in get group: ${error.message}`, error.stack, 'GroupController');
			throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Patch(':id/owner')
	async updateGroupOwner(
		@GetUser() { id: userId }: User,
		@Param('id') groupId: number,
		@Body() { newOwnerId }: TransferOwnerDto,
	) {
		try {
			const params = { userId, groupId, newOwnerId };
			const group = await this.groupService.transferGroupOwner(params);
			this.eventEmitter.emit('group.owner.update', group);
			return group;
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			this.logger.error(`Error in update group owner: ${error.message}`, error.stack, 'GroupController');
			throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Patch(':id/details')
	@UseInterceptors(FileInterceptor('avatar'))
	async updateGroupDetails(
		@Body() { title }: UpdateGroupDetailsDto,
		@Param('id', ParseIntPipe) id: number,
		@UploadedFile() avatar: Attachment,
	) {
		try {
			console.log(avatar);
			console.log(title);
			return this.groupService.updateDetails({ id, avatar, title });
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			this.logger.error(`Error in update group details: ${error.message}`, error.stack, 'GroupController');
			throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
