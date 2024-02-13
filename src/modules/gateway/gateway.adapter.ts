import { IoAdapter } from "@nestjs/platform-socket.io";
import { Repository } from "typeorm";
import { AuthenticatedSocket } from "src/common/utils/interfaces";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/entities/user.entity";
import { NestApplicationContext } from '@nestjs/core';
import { IAuthService } from "src/modules/auth/services/interface-auth.service";
import * as dotenv from 'dotenv'
import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Services } from "src/common/utils/constrants";
dotenv.config();

export class WebsocketAdapter extends IoAdapter {
    constructor(
        @Inject(Services.AUTH) private authService: IAuthService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {
        super();
    }

    async createIOServer(port: number, options?: any) {
        const appContext = new NestApplicationContext(options.container, options.scope);
        const userRepository: Repository<User> = appContext.get('UserRepository');

        const server = super.createIOServer(port, options);

        server.use(async (socket: AuthenticatedSocket, next) => {
            console.log('Inside Websocket Adapter');

            const clientJwt = socket.handshake.headers.authorization;

            if (!clientJwt) {
                console.log('Client has no jwt');
                return next(new Error('Not Authenticated. No jwt were sent'));
            }

            let token: string;

            if (clientJwt.startsWith('Bearer')) {
                token = clientJwt.split('Bearer ')[1];
            } else {
                token = clientJwt;
            }

            try {
                const decodedToken = await this.verifyToken(token);

                if (!decodedToken) {
                    return next(new Error('Not Authenticated. Invalid token'));
                }

                if (this.isTokenExpired(decodedToken)) {
                    await this.refreshToken(socket, decodedToken);
                }

                const user = await this.getUserFromToken(decodedToken);

                if (!user) {
                    return next(new Error('Not Authenticated. User not found'));
                }

                socket.user = user;
                next();
            } catch (error) {
                console.log('Error verifying JWT:', error.message);
                return next(new Error('Not Authenticated. Invalid token'));
            }
        });
    }

    private async verifyToken(token: string): Promise<any> {
        return this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
        });
    }

    private isTokenExpired(decodedToken: any): boolean {
        return Date.now() >= decodedToken.exp * 1000;
    }

    private async refreshToken(socket: AuthenticatedSocket, decodedToken: any): Promise<void> {
        const userId = decodedToken.sub;
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user || !user.refreshToken) {
            return Promise.reject(new Error('Not Authenticated. User or refresh token not found'));
        }

        try {
            const newToken = await this.authService.generateAccessTokenFromRefreshToken(user.refreshToken);

            if (newToken && newToken.accessToken) {
                const newDecodedToken = await this.verifyToken(newToken.accessToken);

                socket.user = newDecodedToken as User;
            }
        } catch (refreshTokenError) {
            console.error('Error generating access token from refresh token:', refreshTokenError);
            return Promise.reject(new Error('Not Authenticated. Error refreshing token'));
        }
    }

    private async getUserFromToken(decodedToken: any): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { id: decodedToken.sub }, relations: ['roles'] });
    }
}
