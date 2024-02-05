import { DeleteFriendRequestParams } from "src/common/utils/types";
import { Friend } from "../../entities/friend.entity";
import { IFriendService } from "../interface-friend.service";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Transaction } from "typeorm";

@Injectable()
export class FriendService implements IFriendService {
    constructor(
        @InjectRepository(Friend)
        private readonly friendsRepository: Repository<Friend>,
    ) { }

    async getFriends(id: number): Promise<Friend[]> {
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

        return friends;
    }

    findFriendById(id: number): Promise<Friend> {
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
    }

    async deleteFriend({ id, userId }: DeleteFriendRequestParams) {
        try {
            const friend = await this.findFriendById(id);

            if (!friend) {
                throw new HttpException("Friend not found", HttpStatus.NOT_FOUND);
            }

            if (friend.receiver.id !== userId && friend.sender.id !== userId) {
                throw new HttpException("Unauthorized to delete this friend", HttpStatus.UNAUTHORIZED);
            }

            await this.friendsRepository.delete(id);
            return friend;
        } catch (error) {
            console.error(`Error deleting friend: ${error.message}`);
            throw new HttpException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    isFriends(userOneId: number, userTwoId: number) {
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
    }
}
