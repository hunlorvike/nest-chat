import { DeleteFriendRequestParams } from "src/common/utils/types";
import { Friend } from "../entities/friend.entity";

export interface IFriendService {
    getFriends(id: number): Promise<Friend[]>;

    findFriendById(id: number): Promise<Friend>;

    deleteFriend(params: DeleteFriendRequestParams);
    
    isFriends(userOneId: number, userTwoId: number): Promise<Friend | undefined>;
}