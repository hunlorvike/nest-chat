import { CreateGroupMessageParams, DeleteGroupMessageParams, EditGroupMessageParams } from "src/common/utils/types";
import { GroupMessage } from "../entities/group-message.entity";

export interface IGroupMessageService {
    createGroupMessage(params: CreateGroupMessageParams);
    getGroupMessages(id: number): Promise<GroupMessage[]>;
    deleteGroupMessage(params: DeleteGroupMessageParams);
    editGroupMessage(params: EditGroupMessageParams): Promise<GroupMessage>;
}