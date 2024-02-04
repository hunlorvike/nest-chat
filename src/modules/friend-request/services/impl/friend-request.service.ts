import { FriendRequestParams, AcceptFriendRequestResponse, CancelFriendRequestParams, CreateFriendParams } from "src/common/utils/types";
import { FriendRequest } from "../../entities/friend-request.entity";
import { IFriendRequestService } from "../interface-friend-request.service";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/modules/friend/entities/friend.entity";
import { Repository } from "typeorm";
import { Services } from "src/common/utils/constrants";
import { IUserService } from "src/modules/user/services/interface-user.service";
import { IFriendService } from "src/modules/friend/services/interface-friend.service";

@Injectable()
export class FriendRequestService implements IFriendRequestService {
    constructor(
        @InjectRepository(Friend) private readonly friendRepository: Repository<Friend>,
        @InjectRepository(FriendRequest) private readonly friendRequestRepository: Repository<FriendRequest>,
        @Inject(Services.USER) private readonly userService: IUserService,
        @Inject(Services.FRIENDS_SERVICE) private readonly friendService: IFriendService
    ) { }

    async accept({ id, userId }: FriendRequestParams) {
        const friendRequest = await this.findById(id);
        if (!friendRequest) {
            throw new HttpException("Friend request not found", HttpStatus.NOT_FOUND);
        }

        if (friendRequest.status === 'accepted') {
            throw new HttpException("Friend request has already been accepted", HttpStatus.BAD_REQUEST);
        }

        if (friendRequest.receiver.id !== userId) {
            throw new HttpException("You are not authorized to accept this friend request", HttpStatus.UNAUTHORIZED);
        }

        friendRequest.status = 'accepted';
        const updatedFriendRequest = await this.friendRequestRepository.save(friendRequest);

        const newFriend = this.friendRepository.create({
            sender: friendRequest.sender,
            receiver: friendRequest.receiver,
        });

        const friend = await this.friendRepository.save(newFriend);

        return { friend, friendRequest: updatedFriendRequest };
    }

    async cancel({ id, userId }: CancelFriendRequestParams) {
        const friendRequest = await this.findById(id);
        if (!friendRequest) {
            throw new HttpException("Friend not found", HttpStatus.NOT_FOUND);
        }

        if (friendRequest.sender.id !== userId) {
            throw new HttpException("You are not authorized to cancel this friend request", HttpStatus.UNAUTHORIZED);
        }

        await this.friendRequestRepository.delete(id);
        return friendRequest;
    }

    async create({ user: sender, username }: CreateFriendParams) {
        const receiver = await this.userService.findUser({ username });
        if (!receiver) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        const exists = await this.isPending(sender.id, receiver.id);
        if (exists) {
            throw new HttpException("Friend request is already pending", HttpStatus.BAD_REQUEST);
        }

        if (receiver.id === sender.id) {
            throw new HttpException("Cannot add yourself as a friend", HttpStatus.BAD_REQUEST);
        }

        const isFriends = await this.friendService.isFriends(sender.id, receiver.id);
        if (isFriends) {
            throw new HttpException("Friend relationship already exists", HttpStatus.BAD_REQUEST);
        }

        const friend = this.friendRequestRepository.create({
            sender,
            receiver,
            status: 'pending',
        });

        return this.friendRequestRepository.save(friend);
    }

    async reject({ id, userId }: CancelFriendRequestParams) {
        const friendRequest = await this.findById(id);
        if (!friendRequest) {
            throw new HttpException("Friend not found", HttpStatus.NOT_FOUND);
        }

        if (friendRequest.status === 'accepted') {
            throw new HttpException("Friend request has already been accepted", HttpStatus.BAD_REQUEST);
        }

        if (friendRequest.receiver.id !== userId) {
            throw new HttpException("You are not authorized to reject this friend request", HttpStatus.UNAUTHORIZED);
        }

        friendRequest.status = 'rejected';
        return this.friendRequestRepository.save(friendRequest);
    }

    getFriendRequests(id: number): Promise<FriendRequest[]> {
        const status = 'pending';
        return this.friendRequestRepository.find({
            where: [
                { sender: { id }, status },
                { receiver: { id }, status },
            ],
            relations: ['receiver', 'sender', 'receiver.profile', 'sender.profile'],
        });
    }

    isPending(userOneId: number, userTwoId: number) {
        return this.friendRequestRepository.findOne({
            where: [
                {
                    sender: { id: userOneId },
                    receiver: { id: userTwoId },
                    status: 'pending',
                },
                {
                    sender: { id: userTwoId },
                    receiver: { id: userOneId },
                    status: 'pending',
                },
            ],
        });
    }

    findById(id: number): Promise<FriendRequest> {
        return this.friendRequestRepository.findOne({
            where: { id },
            relations: ['receiver', 'sender'],
        });
    }

}