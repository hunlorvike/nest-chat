import { CreateUserDetails, ValidateUserDetails } from "src/common/utils/types";
import { User } from "src/modules/user/entities/user.entity";

export interface IAuthService {
    signUp(userDetails: CreateUserDetails): Promise<User>;

    signIn(userCredentials: ValidateUserDetails): Promise<{ accessToken: string }>

    validateUser(userCredentials: ValidateUserDetails): Promise<User | null>;

    generateRefreshToken(username: string): Promise<{ refreshToken: string }>;

    generateAccessToken(user: Partial<User>): Promise<{ accessToken: string }>;

    generateAccessTokenFromRefreshToken(refreshToken: string): Promise<{ accessToken: string }>;

    validateToken(token: string): Promise<any>;

    getUserRoles(userId: number): Promise<string[]>;
}
