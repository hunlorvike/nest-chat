import { UpdateStatusMessageParams } from "src/common/utils/types";
import { UserPresence } from "../entities/user-presence.entity";
import { User } from "../entities/user.entity";

export interface IUserPresenceService {
    createPresence(): Promise<UserPresence>;
    updateStatus(params: UpdateStatusMessageParams): Promise<User>;
}