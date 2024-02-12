import { IoAdapter } from "@nestjs/platform-socket.io";
import { Repository, getRepository } from "typeorm";
import { AuthenticatedSocket } from "src/common/utils/interfaces";
import { plainToInstance } from "class-transformer";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/entities/user.entity";
import { NestApplicationContext } from '@nestjs/core';

export class WebsocketAdapter extends IoAdapter {
    private readonly jwtService = new JwtService();

    createIOServer(port: number, options?: any) {
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

                const isTokenExpired = Date.now() >= decodedToken.exp * 1000;

                if (isTokenExpired) {
                    const username = decodedToken.username;

                    if (!username) {
                        return next(false);
                    }

                    const user = await userRepository.findOne({ where: { username: username } });

                    if (!user) {
                        return next(false);
                    }

                    socket.user = user;
                    return next();
                }

                socket.user = decodedToken as User;
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
}
