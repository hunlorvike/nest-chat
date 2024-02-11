import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { IGroupRecipientService } from '../interface-group-recipient.service';
import { AddGroupRecipientParams, AddGroupUserResponse, RemoveGroupRecipientParams, RemoveGroupUserResponse, LeaveGroupParams, CheckUserGroupParams } from 'src/common/utils/types';
import { Services } from 'src/common/utils/constrants';
import { IUserService } from 'src/modules/user/services/interface-user.service';
import { IGroupService } from '../interface-group.service';

@Injectable()
export class GroupRecipientService implements IGroupRecipientService {
    constructor(
        @Inject(Services.USER) private userService: IUserService,
        @Inject(Services.GROUP) private groupService: IGroupService,
        private readonly logger: Logger, 
    ) { }

    async addGroupRecipient(params: AddGroupRecipientParams) {
        try {
            const group = await this.groupService.findGroupById(params.id);

            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            }

            if (group.owner.id !== params.userId) {
                throw new HttpException('Insufficient Permissions', HttpStatus.FORBIDDEN);
            }

            const recipient = await this.userService.findUser({
                username: params.username,
            });

            if (!recipient) {
                throw new HttpException('Cannot Add User', HttpStatus.BAD_REQUEST);
            }

            const inGroup = group.users.find((user) => user.id === recipient.id);

            if (inGroup) {
                throw new HttpException('User already in group', HttpStatus.BAD_REQUEST);
            }

            group.users = [...group.users, recipient];
            const savedGroup = await this.groupService.saveGroup(group);

            return { group: savedGroup, user: recipient };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in add group recipient: ${error.message}`, error.stack, 'GroupRecipientService');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeGroupRecipient(params: RemoveGroupRecipientParams) {
        try {
            const { issuerId, removeUserId, id } = params;

            const userToBeRemoved = await this.userService.findUser({
                id: removeUserId,
            });

            if (!userToBeRemoved) {
                throw new HttpException('User cannot be removed', HttpStatus.BAD_REQUEST);
            }

            const group = await this.groupService.findGroupById(id);

            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            }

            if (group.owner.id !== issuerId) {
                throw new HttpException('Not group owner', HttpStatus.BAD_REQUEST);
            }

            if (group.owner.id === removeUserId) {
                throw new HttpException(
                    'Cannot remove yourself as owner',
                    HttpStatus.BAD_REQUEST,
                );
            }

            group.users = group.users.filter((u) => u.id !== removeUserId);

            const savedGroup = await this.groupService.saveGroup(group);

            return { group: savedGroup, user: userToBeRemoved };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in remove group recipient: ${error.message}`, error.stack, 'GroupRecipientService');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async isUserInGroup({ id, userId }: CheckUserGroupParams) {
        try {
            const group = await this.groupService.findGroupById(id);
            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            }

            const user = group.users.find((user) => user.id === userId);
            if (!user) {
                throw new HttpException('User not found in the group', HttpStatus.NOT_FOUND);
            }

            return group;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in check user in group: ${error.message}`, error.stack, 'GroupRecipientService');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async leaveGroup({ id, userId }: LeaveGroupParams) {
        try {
            const group = await this.isUserInGroup({ id, userId });
            console.log(`Updating Groups`);
            if (group.owner.id === userId)
                throw new HttpException(
                    'Cannot leave group as owner',
                    HttpStatus.BAD_REQUEST,
                );
            console.log('New Users in Group after leaving...');
            console.log(group.users.filter((user) => user.id !== userId));
            group.users = group.users.filter((user) => user.id !== userId);
            return this.groupService.saveGroup(group);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in leave group: ${error.message}`, error.stack, 'GroupRecipientService');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
