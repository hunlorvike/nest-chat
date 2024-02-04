import { FriendRequestParams, CancelFriendRequestParams, CreateFriendParams, AcceptFriendRequestResponse } from "src/common/utils/types";
import { FriendRequest } from "../entities/friend-request.entity";

export interface IFriendRequestService {
    accept(params: FriendRequestParams): Promise<AcceptFriendRequestResponse>;
    cancel(params: CancelFriendRequestParams): Promise<FriendRequest>;
    create(params: CreateFriendParams);
    reject(params: CancelFriendRequestParams): Promise<FriendRequest>;
    getFriendRequests(userId: number): Promise<FriendRequest[]>;
    isPending(userOneId: number, userTwoId: number);
    findById(id: number): Promise<FriendRequest>;
}