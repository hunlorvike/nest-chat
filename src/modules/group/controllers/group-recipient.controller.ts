import { Body, Controller, Delete, Inject, Param, ParseIntPipe, Post, UseGuards, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { User } from 'src/modules/user/entities/user.entity';
import { AddGroupRecipientDto } from '../dtos/add-group-recipient.dto';
import { IGroupRecipientService } from '../services/interface-group-recipient.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Group } from '../entities/group.entity';

@ApiTags(ApiTagConfigs.GROUP_RECIPIENT)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Roles()
@Controller(Routes.GROUP_RECIPIENTS)
export class GroupRecipientController {
    constructor(
        @Inject(Services.GROUP_RECIPIENT)
        private readonly groupRecipientService: IGroupRecipientService,
        private readonly eventEmitter: EventEmitter2,
        private readonly logger: Logger,
    ) { }

    @ApiOperation({ summary: 'Add a user to a group' })
    @ApiParam({ name: 'id', description: 'Group ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'Successfully added group recipient', type: Group })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post(':id')
    async addGroupRecipient(
        @GetUser() { id: userId }: User,
        @Param('id', ParseIntPipe) id: number,
        @Body() { username }: AddGroupRecipientDto,
    ) {
        try {
            const params = { id, userId, username };
            const response = await this.groupRecipientService.addGroupRecipient(params);
            this.eventEmitter.emit('group.user.add', response);
            return response;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in add group recipient: ${error.message}`, error.stack, 'GroupRecipientController');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: 'Leave a group' })
    @ApiParam({ name: 'id', description: 'Group ID', type: 'number' })
    @ApiResponse({ status: 200, description: 'Successfully left the group', type: Group })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Delete('leave/:id')
    async leaveGroup(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
    ) {
        try {
            const group = await this.groupRecipientService.leaveGroup({
                id: groupId,
                userId: user.id,
            });
            this.eventEmitter.emit('group.user.leave', { group, userId: user.id });
            return group;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in leave group: ${error.message}`, error.stack, 'GroupRecipientController');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: 'Remove a user from a group' })
    @ApiParam({ name: 'id', description: 'Group ID', type: 'number' })
    @ApiParam({ name: 'userId', description: 'User ID to be removed', type: 'number' })
    @ApiResponse({ status: 200, description: 'Successfully removed group recipient', type: Group })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Delete(':id/:userId')
    async removeGroupRecipient(
        @GetUser() { id: issuerId }: User,
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) removeUserId: number,
    ) {
        try {
            const params = { issuerId, id, removeUserId };
            const response = await this.groupRecipientService.removeGroupRecipient(params);
            this.eventEmitter.emit('group.user.remove', response);
            return response.group;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in remove group recipient: ${error.message}`, error.stack, 'GroupRecipientController');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
