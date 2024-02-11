import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { IGroupService } from '../interface-group.service';
import { CreateGroupParams, FetchGroupsParams, AccessParams, TransferOwnerParams, UpdateGroupDetailsParams } from 'src/common/utils/types';
import { User } from 'src/modules/user/entities/user.entity';
import { Group } from '../../entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Services } from 'src/common/utils/constrants';
import { IUserService } from 'src/modules/user/services/interface-user.service';
import { IImageStorageService } from 'src/modules/image-storage/services/interface-image-storage.service';
import { generateUUIDV4 } from 'src/common/utils/helpers';

@Injectable()
export class GroupService implements IGroupService {
    constructor(
        @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
        @Inject(Services.USER) private readonly userService: IUserService,
        @Inject(Services.IMAGE_UPLOAD_SERVICE) private readonly imageStorageService: IImageStorageService,
        private readonly logger: Logger,
    ) { }

    async createGroup(params: CreateGroupParams) {
        try {
            const { creator, title } = params;
            const usersPromise = params.users.map((username) =>
                this.userService.findUser({ username }),
            );
            const users = (await Promise.all(usersPromise)).filter((user) => user);
            users.push(creator);
            const groupParams = { owner: creator, users, creator, title };
            const group = this.groupRepository.create(groupParams);
            return this.groupRepository.save(group);
        } catch (error) {
            this.logger.error(`Error in create group: ${error.message}`, error.stack, 'GroupService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    getGroups(params: FetchGroupsParams): Promise<Group[]> {
        try {
            return this.groupRepository
                .createQueryBuilder('group')
                .leftJoinAndSelect('group.users', 'user')
                .where('user.id IN (:users)', { users: [params.userId] })
                .leftJoinAndSelect('group.users', 'users')
                .leftJoinAndSelect('group.creator', 'creator')
                .leftJoinAndSelect('group.owner', 'owner')
                .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
                .leftJoinAndSelect('users.profile', 'usersProfile')
                .leftJoinAndSelect('users.presence', 'usersPresence')
                .orderBy('group.lastMessageSentAt', 'DESC')
                .getMany();
        } catch (error) {
            this.logger.error(`Error in get groups: ${error.message}`, error.stack, 'GroupService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    findGroupById(id: number): Promise<Group> {
        try {
            return this.groupRepository.findOne({
                where: { id },
                relations: [
                    'creator',
                    'users',
                    'lastMessageSent',
                    'owner',
                    'users.profile',
                    'users.presence',
                ],
            });
        } catch (error) {
            this.logger.error(`Error in find group by id: ${error.message}`, error.stack, 'GroupService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    saveGroup(group: Group): Promise<Group> {
        try {
            return this.groupRepository.save(group);
        } catch (error) {
            this.logger.error(`Error in save group: ${error.message}`, error.stack, 'GroupService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async hasAccess({ id, userId }: AccessParams): Promise<User | undefined> {
        try {
            const group = await this.findGroupById(id);
            if (!group) throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            return group.users.find((user) => user.id === userId);
        } catch (error) {
            this.logger.error(`Error in has access: ${error.message}`, error.stack, 'GroupService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async transferGroupOwner({
        userId,
        groupId,
        newOwnerId,
    }: TransferOwnerParams): Promise<Group> {
        try {
            const group = await this.findGroupById(groupId);
            if (!group) throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            if (group.owner.id !== userId) {
                throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
            }
            if (group.owner.id === newOwnerId) {
                throw new HttpException('Cannot transfer owner to yourself', HttpStatus.BAD_REQUEST);
            }
            const newOwner = await this.userService.findUser({ id: newOwnerId });
            if (!newOwner) throw new HttpException('New owner not found', HttpStatus.NOT_FOUND);
            group.owner = newOwner;
            return this.groupRepository.save(group);
        } catch (error) {
            this.logger.error(`Error in transfer group owner: ${error.message}`, error.stack, 'GroupService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateDetails(params: UpdateGroupDetailsParams): Promise<Group> {
        try {
            const group = await this.findGroupById(params.id);
            if (!group) throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            if (params.avatar) {
                const key = generateUUIDV4();
                await this.imageStorageService.upload({ key, file: params.avatar });
                group.avatar = key;
            }
            group.title = params.title ?? group.title;
            return this.groupRepository.save(group);
        } catch (error) {
            this.logger.error(`Error in update group details: ${error.message}`, error.stack, 'GroupService');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
