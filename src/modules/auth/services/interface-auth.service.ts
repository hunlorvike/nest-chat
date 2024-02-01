import { CreateUserDetails, ValidateUserDetails } from "src/common/utils/types";
import { User } from "src/modules/user/entities/user.entity";

export interface IAuthService {
    signUp(userDetails: CreateUserDetails): Promise<User>;
    
    signIn(userCredentials: ValidateUserDetails): Promise<string>; 

    validateUser(userCredentials: ValidateUserDetails): Promise<User | null>;

    validateToken(token: string): Promise<any>;
    
    getUserRoles(userId: number): Promise<string[]>;
}
