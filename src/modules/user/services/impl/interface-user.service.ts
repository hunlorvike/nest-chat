import { FindUserOptions, FindUserParams } from "src/common/utils/types";
import { User } from "../../entities/user.entity";

export interface IUserService {
    findUser(
        findUserParams: FindUserParams,
        options?: FindUserOptions,
    ): Promise<User>;

}