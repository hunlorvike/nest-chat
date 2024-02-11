import { UpdateUserProfileParams } from "src/common/utils/types";
import { User } from "../entities/user.entity";

export interface IUserProfile {
    createProfile();
    updateProfile(user: User, params: UpdateUserProfileParams);
    createProfileOrUpdate(user: User, params: UpdateUserProfileParams);
}