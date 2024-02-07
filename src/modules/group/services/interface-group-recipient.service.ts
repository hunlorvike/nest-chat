import { AddGroupRecipientParams, AddGroupUserResponse, RemoveGroupRecipientParams, RemoveGroupUserResponse, LeaveGroupParams, CheckUserGroupParams } from "src/common/utils/types";
import { Group } from "../entities/group.entity";

export interface IGroupRecipientService {
    addGroupRecipient(
        params: AddGroupRecipientParams,
    ): Promise<AddGroupUserResponse>;
    removeGroupRecipient(
        params: RemoveGroupRecipientParams,
    ): Promise<RemoveGroupUserResponse>;
    leaveGroup(params: LeaveGroupParams);
    isUserInGroup(params: CheckUserGroupParams): Promise<Group>;
}