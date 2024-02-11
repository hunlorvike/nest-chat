import { DeleteFriendRequestParams } from "src/common/utils/types";
import { Friend } from "../../entities/friend.entity";
import { IFriendService } from "../interface-friend.service";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Transaction } from "typeorm";

@Injectable()
export class FriendService implements IFriendService {
    constructor(
        @InjectRepository(Friend)
        private readonly friendsRepository: Repository<Friend>,
        private readonly logger: Logger,
    ) { }

    async getFriends(id: number): Promise<Friend[]> {
        try {
            const friends = await this.friendsRepository
                .createQueryBuilder('friend')
                .leftJoinAndSelect('friend.sender', 'sender')
                .leftJoinAndSelect('friend.receiver', 'receiver')
                .leftJoinAndSelect('sender.profile', 'senderProfile')
                .leftJoinAndSelect('receiver.profile', 'receiverProfile')
                .leftJoinAndSelect('sender.presence', 'senderPresence')
                .leftJoinAndSelect('receiver.presence', 'receiverPresence')
                .where('sender.id = :id OR receiver.id = :id', { id })
                .getMany();

            const processedFriends = friends.map((friend) => ({
                id: friend.id,
                sender: this.processUser(friend.sender),
                receiver: this.processUser(friend.receiver),
                createdAt: friend.createdAt,
            }));

            return processedFriends;
        } catch (error) {
            this.logger.error(`Error in getFriends: ${error.message}`, error.stack, 'FriendService');
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findFriendById(id: number): Promise<Friend> {
        try {
            return this.friendsRepository.findOne({
                where: { id },
                relations: [
                    'sender',
                    'receiver',
                    'sender.profile',
                    'sender.presence',
                    'receiver.profile',
                    'receiver.presence',
                ],
            });
        } catch (error) {
            this.logger.error(`Error in findFriendById: ${error.message}`, error.stack, 'FriendService');
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteFriend({ id, userId }: DeleteFriendRequestParams): Promise<Friend> {
        try {
            const friend = await this.findFriendById(id);

            if (!friend) {
                throw new HttpException("Friend not found", HttpStatus.NOT_FOUND);
            }

            if (!this.isAuthorizedToDelete(friend, userId)) {
                throw new HttpException("Unauthorized to delete this friend", HttpStatus.UNAUTHORIZED);
            }

            await this.friendsRepository.delete(id);
            return friend;
        } catch (error) {
            this.logger.error(`Error in deleteFriend: ${error.message}`, error.stack, 'FriendService');
            throw new HttpException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async isFriends(userOneId: number, userTwoId: number): Promise<Friend | undefined> {
        try {
            return this.friendsRepository.findOne({
                where: [
                    {
                        sender: { id: userOneId },
                        receiver: { id: userTwoId },
                    },
                    {
                        sender: { id: userTwoId },
                        receiver: { id: userOneId },
                    },
                ],
            });
        } catch (error) {
            this.logger.error(`Error in isFriends: ${error.message}`, error.stack, 'FriendService');
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private processUser(user: any): any {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }

    private isAuthorizedToDelete(friend: Friend, userId: number): boolean {
        return friend.receiver.id === userId || friend.sender.id === userId;
    }
}
