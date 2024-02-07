import { CreateGroupParams, FetchGroupsParams, AccessParams, TransferOwnerParams, UpdateGroupDetailsParams } from "src/common/utils/types";
import { User } from "src/modules/user/entities/user.entity";
import { Group } from "../entities/group.entity";

export interface IGroupService {
    createGroup(params: CreateGroupParams);
    getGroups(params: FetchGroupsParams): Promise<Group[]>;
    findGroupById(id: number): Promise<Group>;
    saveGroup(group: Group): Promise<Group>;
    hasAccess(params: AccessParams): Promise<User | undefined>;
    transferGroupOwner(params: TransferOwnerParams): Promise<Group>;
    updateDetails(params: UpdateGroupDetailsParams): Promise<Group>;

}