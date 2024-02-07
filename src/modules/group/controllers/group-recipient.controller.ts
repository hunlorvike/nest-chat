

import { Body, Controller, Delete, Inject, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { User } from 'src/modules/user/entities/user.entity';
import { AddGroupRecipientDto } from '../dtos/add-group-recipient.dto';
import { IGroupRecipientService } from '../services/interface-group-recipient.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiTags(ApiTagConfigs.GROUP)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Roles()
@Controller(Routes.GROUP_RECIPIENTS)
export class GroupRecipientController {
    constructor(
        @Inject(Services.GROUP_RECIPIENT)
        private readonly groupRecipientService: IGroupRecipientService,
        private eventEmitter: EventEmitter2,
    ) { }

    @Post()
    async addGroupRecipient(
        @GetUser() { id: userId }: User,
        @Param('id', ParseIntPipe) id: number,
        @Body() { username }: AddGroupRecipientDto,
    ) {
        const params = { id, userId, username };
        const response = await this.groupRecipientService.addGroupRecipient(params);
        this.eventEmitter.emit('group.user.add', response);
        return response;
    }

    /**
     * Leaves a Group
     * @param user the authenticated User
     * @param groupId the id of the group
     * @returns the updated Group that the user had left
     */
    @Delete('leave')
    async leaveGroup(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
    ) {
        const group = await this.groupRecipientService.leaveGroup({
            id: groupId,
            userId: user.id,
        });
        this.eventEmitter.emit('group.user.leave', { group, userId: user.id });
        return group;
    }

    @Delete(':userId')
    async removeGroupRecipient(
        @GetUser() { id: issuerId }: User,
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) removeUserId: number,
    ) {
        const params = { issuerId, id, removeUserId };
        const response = await this.groupRecipientService.removeGroupRecipient(
            params,
        );
        this.eventEmitter.emit('group.user.remove', response);
        return response.group;
    }
}
