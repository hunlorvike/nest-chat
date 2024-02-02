import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Observable } from "rxjs";
import { IAuthService } from "src/modules/auth/services/interface-auth.service";
import { User } from "src/modules/user/entities/user.entity";
import { Repository } from "typeorm";
import { Services } from "../utils/constrants";
import { Messages } from "../utils/response-message";
import * as dotenv from 'dotenv'
dotenv.config();

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly jwtService: JwtService,
        @Inject(Services.AUTH) private authService: IAuthService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization.split(' ')[1];

        if (!token) {
            throw new HttpException(Messages.TOKEN_INVALID, HttpStatus.UNAUTHORIZED);
        }

        try {
            const decodedToken = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });

            if (!decodedToken) {
                throw new HttpException(Messages.TOKEN_INVALID, HttpStatus.UNAUTHORIZED);
            }

            const isTokenExpired = Date.now() >= decodedToken.exp * 1000;
            if (isTokenExpired) {
                const userId = decodedToken.sub;

                const user = await this.userRepository.findOne({ where: { id: userId } });

                if (!user) {
                    return false;
                }

                const refreshToken = user.refreshToken;

                if (refreshToken) {
                    try {
                        const newToken = await this.authService.generateAccessTokenFromRefreshToken(refreshToken);

                        if (newToken && newToken.accessToken) {
                            request.headers.authorization = `Bearer ${newToken.accessToken}`;

                            const sanitizedUser = {
                                id: user?.id,
                                username: user?.username,
                                email: user?.email,
                                roles: user?.roles,
                                firstName: user?.firstName,
                                lastName: user?.lastName,
                            };

                            request.headers['user'] = (sanitizedUser);
                            return true;
                        }
                    } catch (refreshTokenError) {
                        console.error('Error generating access token from refresh token:', refreshTokenError);
                        throw new HttpException(refreshTokenError.message, HttpStatus.UNAUTHORIZED);
                    }
                }
                return false;
            }

            const user = await this.userRepository.findOne({ where: { id: decodedToken.sub } });

            const sanitizedUser = {
                id: user?.id,
                username: user?.username,
                email: user?.email,
                roles: user?.roles,
                firstName: user?.firstName,
                lastName: user?.lastName,
            };

            request.headers['user'] = (sanitizedUser);
            return true;
        } catch (error) {
            console.error('Error validating token:', error);
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }
}
