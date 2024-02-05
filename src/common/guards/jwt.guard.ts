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
        const token = this.extractTokenFromRequest(request);

        if (!token) {
            this.throwUnauthorized(Messages.TOKEN_INVALID);
        }

        try {
            const decodedToken = await this.verifyToken(token);

            if (!decodedToken) {
                this.throwUnauthorized(Messages.TOKEN_INVALID);
            }

            if (this.isTokenExpired(decodedToken)) {
                await this.refreshToken(request, decodedToken);
            }

            const user = await this.getUserFromToken(decodedToken);

            if (!user) {
                return false;
            }

            const sanitizedUser = this.sanitizeUser(user);
            request.headers['user'] = sanitizedUser;

            return true;
        } catch (error) {
            console.error('Error validating token:', error);
            this.throwUnauthorized(error.message);
        }
    }

    private extractTokenFromRequest(request: any): string | null {
        const authHeader = request.headers.authorization;
        return authHeader ? authHeader.split(' ')[1] : null;
    }

    private throwUnauthorized(message: string): void {
        throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }

    private async verifyToken(token: string): Promise<any> {
        return this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
        });
    }

    private isTokenExpired(decodedToken: any): boolean {
        return Date.now() >= decodedToken.exp * 1000;
    }

    private async refreshToken(request: any, decodedToken: any): Promise<void> {
        const userId = decodedToken.sub;
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user || !user.refreshToken) {
            this.throwUnauthorized(Messages.TOKEN_INVALID);
        }

        try {
            const newToken = await this.authService.generateAccessTokenFromRefreshToken(user.refreshToken);

            if (newToken && newToken.accessToken) {
                request.headers.authorization = `Bearer ${newToken.accessToken}`;

                const sanitizedUser = this.sanitizeUser(user);
                request.headers['user'] = sanitizedUser;
            }
        } catch (refreshTokenError) {
            console.error('Error generating access token from refresh token:', refreshTokenError);
            this.throwUnauthorized(refreshTokenError.message);
        }
    }

    private async getUserFromToken(decodedToken: any): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { id: decodedToken.sub }, relations: ['roles'] });
    }

    private sanitizeUser(user: User): any {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles.map(role => role.name),
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
}
