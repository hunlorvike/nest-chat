import { CreateUserDetails, FindUserOptions, FindUserParams } from "src/common/utils/types";
import { User } from "../entities/user.entity";

export interface IUserService {
    createUser(userDetails: CreateUserDetails): Promise<User>;

    findUser(
        findUserParams: FindUserParams,
        options?: FindUserOptions,
    ): Promise<User>;

    saveUser(user: User): Promise<User>;
    
    searchUsers(query: string): Promise<User[]>;

}