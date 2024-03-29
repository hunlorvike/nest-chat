import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from '../interface-auth.service';
import { CreateUserDetails, ValidateUserDetails } from 'src/common/utils/types';
import { Services } from 'src/common/utils/constrants';
import { IUserService } from 'src/modules/user/services/interface-user.service';
import { compareHash, hashPassword } from 'src/common/utils/helpers';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/common/enums/roles.enum';
import { Role } from 'src/modules/user/entities/role.entity';
import * as jwt from 'jsonwebtoken';
import { Messages } from 'src/common/utils/response-message';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(Services.USER) private readonly userService: IUserService,
        private readonly jwtService: JwtService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    ) { }

    async signUp(userDetails: CreateUserDetails): Promise<User> {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { username: userDetails.username },
            });

            if (existingUser) {
                throw new HttpException(Messages.USER_EXISTS, HttpStatus.CONFLICT);
            }

            const newUser = this.userRepository.create(userDetails);

            const hashPassworded = await hashPassword(userDetails.password);
            newUser.password = hashPassworded;

            const userRole = await this.roleRepository.findOne({ where: { name: Roles.USER } });
            newUser.roles = [userRole];

            const refreshToken = await this.generateRefreshToken(userDetails.username);

            newUser.refreshToken = refreshToken.refreshToken;

            await this.userRepository.save(newUser);

            return newUser;
        } catch (error) {
            console.error('Error in signUp:', error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async signIn(userCredentials: ValidateUserDetails): Promise<{ accessToken: string }> {
        try {
            const user = await this.userRepository.findOne(
                {
                    where: { username: userCredentials.username },
                    relations: ['roles'],
                },
            );

            if (!user) {
                throw new HttpException(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const isPasswordValid = await compareHash(
                userCredentials.password,
                user.password,
            );

            if (!isPasswordValid) {
                throw new HttpException(Messages.INCORRECT_PASSWORD, HttpStatus.UNAUTHORIZED);
            }
            // Tạo AccessToken
            const { accessToken } = await this.generateAccessToken(user);

            return { accessToken };
        } catch (error) {
            console.error('Error in signIn:', error);
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }

    async validateUser(userCredentials: ValidateUserDetails) {
        const user = await this.userService.findUser(
            { username: userCredentials.username },
            { selectAll: true },
        );
        if (!user)
            throw new HttpException(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
        const isPasswordValid = await compareHash(
            userCredentials.password,
            user.password,
        );
        console.log(isPasswordValid);
        return isPasswordValid ? user : null;
    }

    async generateRefreshToken(username: string): Promise<{ refreshToken: string }> {
        const options: JwtSignOptions = {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_REFRESH_TOKEN_TTL,
        };
        const refreshToken = await this.jwtService.signAsync({ sub: username }, options);

        return { refreshToken };
    }

    async generateAccessToken(user: Partial<User>): Promise<{ accessToken: string }> {
        if (user && user.roles && user.roles.length > 0) {
            const payload = {
                sub: user.id,
                username: user.username,
                role: user.roles.map(role => role.name),
            };

            const options: JwtSignOptions = {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_ACCESS_TOKEN_TTL,
            };

            const accessToken = await this.jwtService.signAsync(payload, options);

            return { accessToken };
        } else {
            // Xử lý khi user hoặc roles không tồn tại
            throw new Error(Messages.USER_ROLES_NOT_AVAILABLE);
        }
    }

    async generateAccessTokenFromRefreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const decodedToken = await this.jwtService.verifyAsync(refreshToken);

            const username = decodedToken.sub;

            const user = await this.userService.findUser({ username }, { selectAll: true });

            if (!user) {
                throw new HttpException(Messages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }

            const { accessToken } = await this.generateAccessToken(user);

            return { accessToken };
        } catch (error) {
            console.error('Error generating access token from refresh token:', error);
            throw new HttpException(Messages.REFRESH_TOKEN_INVALID, HttpStatus.UNAUTHORIZED);
        }
    }


    async validateToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw error;
        }
    }

    async getUserRoles(userId: number): Promise<string[]> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['roles'],
            });

            if (user) {
                return user.roles.map((role) => role.name);
            }

            return [];
        } catch (error) {
            console.error('Error getting user roles:', error);
            throw new Error(Messages.USER_ROLES_ERROR);
        }
    }


}
