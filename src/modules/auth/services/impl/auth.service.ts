/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from '../interface-auth.service';
import { CreateUserDetails, ValidateUserDetails } from 'src/common/utils/types';
import { Services } from 'src/common/utils/constrants';
import { IUserService } from 'src/modules/user/services/impl/interface-user.service';
import { compareHash, hashPassword } from 'src/common/utils/helpers';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/modules/user/entities/role.entity';
import { Roles } from 'src/common/enums/roles.enum';
import { User_Role } from 'src/modules/user/entities/users-roles.entity';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(Services.USER) private readonly userService: IUserService,
        private readonly jwtService: JwtService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(User_Role) private readonly userRoleRepository: Repository<User_Role>,

    ) { }

    // Sign Up
    async signUp(userDetails: CreateUserDetails): Promise<User> {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { username: userDetails.username },
            });

            if (existingUser) {
                throw new HttpException('User already exists', HttpStatus.CONFLICT);
            }

            const hashPassworded = await hashPassword(userDetails.password);
            console.log(hashPassworded)
            const newUser = this.userRepository.create({
                ...userDetails,
                password: hashPassworded,
                refreshToken: null,
                roles: [],
            });

            const savedUser = await this.userRepository.save(newUser);

            const refreshToken = await this.generateRefreshToken(userDetails.username);

            savedUser.refreshToken = refreshToken.refreshToken;

            await this.userRepository.save(savedUser);

            const userRoleMapping = this.userRoleRepository.create({
                user: savedUser,
                role: { name: Roles.USER },
            });

            await this.userRoleRepository.save(userRoleMapping);

            return savedUser;
        } catch (error) {
            console.error('Error in signUp:', error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateRefreshToken(username: string): Promise<{ refreshToken: string }> {
        const refreshToken = await this.jwtService.signAsync({ sub: username }, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_TTL || '30d',
            secret: process.env.JWT_SECRET || 'anotherSecretKey',
        });

        return { refreshToken };
    }

    // Sign In
    signIn(userCredentials: ValidateUserDetails): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async validateUser(userCredentials: ValidateUserDetails) {
        const user = await this.userService.findUser(
            { username: userCredentials.username },
            { selectAll: true },
        );
        console.log(user);
        if (!user)
            throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
        const isPasswordValid = await compareHash(
            userCredentials.password,
            user.password,
        );
        console.log(isPasswordValid);
        return isPasswordValid ? user : null;
    }


    // Valid token
    async validateToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw error;
        }
    }

    // Get role
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
            throw new Error('Could not get user roles');
        }
    }


}
