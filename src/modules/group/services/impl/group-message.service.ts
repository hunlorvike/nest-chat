import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { IGroupMessageService } from '../interface-group-message.service';
import { CreateGroupMessageParams, DeleteGroupMessageParams, EditGroupMessageParams } from 'src/common/utils/types';
import { GroupMessage } from '../../entities/group-message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from 'src/common/utils/constrants';
import { IMessageAttachmentsService } from 'src/modules/message-attachment/services/interface-message-attachment.service';
import { Repository } from 'typeorm';
import { Group } from '../../entities/group.entity';
import { instanceToPlain } from 'class-transformer';
import { IGroupService } from '../interface-group.service';

@Injectable()
export class GroupMessageService implements IGroupMessageService {
    constructor(
        @InjectRepository(GroupMessage)
        private readonly groupMessageRepository: Repository<GroupMessage>,
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        @Inject(Services.GROUP)
        private readonly groupService: IGroupService,
        @Inject(Services.MESSAGE_ATTACHMENT)
        private readonly messageAttachmentsService: IMessageAttachmentsService,
        private readonly logger: Logger, 
    ) { }

    async createGroupMessage({
        groupId: id,
        ...params
    }: CreateGroupMessageParams) {
        try {
            const { content, author } = params;
            const group = await this.groupService.findGroupById(id);
            if (!group) {
                throw new HttpException('No Group Found', HttpStatus.BAD_REQUEST);
            }
            const findUser = group.users.find((u) => u.id === author.id);
            if (!findUser) {
                throw new HttpException('User not in group', HttpStatus.BAD_REQUEST);
            }
            const groupMessage = this.groupMessageRepository.create({
                content,
                group,
                author: instanceToPlain(author),
                attachments: params.attachments
                    ? await this.messageAttachmentsService.createGroupAttachments(
                        params.attachments,
                    )
                    : [],
            });
            const savedMessage = await this.groupMessageRepository.save(groupMessage);
            group.lastMessageSent = savedMessage;
            const updatedGroup = await this.groupService.saveGroup(group);
            return { message: savedMessage, group: updatedGroup };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in create group message: ${error.message}`, error.stack, 'GroupMessageService');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteGroupMessage(params: DeleteGroupMessageParams) {
        try {
            console.log(params);
            const group = await this.groupRepository
                .createQueryBuilder('group')
                .where('group.id = :groupId', { groupId: params.groupId })
                .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
                .leftJoinAndSelect('group.messages', 'messages')
                .orderBy('messages.createdAt', 'DESC')
                .limit(5)
                .getOne();

            if (!group) {
                throw new HttpException('Group not found', HttpStatus.BAD_REQUEST);
            }

            const message = await this.groupMessageRepository.findOne({
                where: {
                    id: params.messageId,
                    author: { id: params.userId },
                    group: { id: params.groupId },
                },
            });

            if (!message) {
                throw new HttpException('Cannot delete message', HttpStatus.BAD_REQUEST);
            }

            if (group.lastMessageSent.id !== message.id) {
                return this.groupMessageRepository.delete({ id: message.id });
            }

            const size = group.messages.length;
            const SECOND_MESSAGE_INDEX = 1;
            if (size <= 1) {
                console.log('Last Message Sent is deleted');
                await this.groupRepository.update(
                    { id: params.groupId },
                    { lastMessageSent: null },
                );
                return this.groupMessageRepository.delete({ id: message.id });
            } else {
                console.log('There are more than 1 message');
                const newLastMessage = group.messages[SECOND_MESSAGE_INDEX];
                await this.groupRepository.update(
                    { id: params.groupId },
                    { lastMessageSent: newLastMessage },
                );
                return this.groupMessageRepository.delete({ id: message.id });
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in delete group message: ${error.message}`, error.stack, 'GroupMessageService');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editGroupMessage(params: EditGroupMessageParams) {
        try {
            const messageDB = await this.groupMessageRepository.findOne({
                where: {
                    id: params.messageId,
                    author: { id: params.userId },
                },
                relations: ['group', 'group.creator', 'group.users', 'author'],
            });
            if (!messageDB) {
                throw new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST);
            }
            messageDB.content = params.content;
            return this.groupMessageRepository.save(messageDB);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in edit group message: ${error.message}`, error.stack, 'GroupMessageService');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    getGroupMessages(id: number): Promise<GroupMessage[]> {
        return this.groupMessageRepository.find({
            where: { group: { id } },
            relations: ['author', 'attachments', 'author.profile'],
            order: {
                createdAt: 'DESC',
            },
        });
    }
}
