import { Inject } from '@nestjs/common';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { Services } from '../utils/constrants';
import { IAuthService } from 'src/modules/auth/services/interface-auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';

dotenv.config();

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly jwtService: JwtService,
		@Inject(Services.AUTH) private authService: IAuthService,
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const roles = this.reflector.get<string[]>('roles', context.getHandler());

		if (!roles) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromRequest(request);

		if (!token) {
			return false;
		}

		try {
			const decodedToken = await this.verifyToken(token);

			if (!decodedToken || !decodedToken.role || !Array.isArray(decodedToken.role)) {
				return false;
			}

			if (this.isTokenExpired(decodedToken)) {
				await this.refreshToken(request, decodedToken);
			}

			const lowercaseRoles = roles.map((role) => role.toLowerCase());
			const userRoles = decodedToken.role.map((role) => role.toLowerCase());

			const user = await this.getUserFromToken(decodedToken);

			const sanitizedUser = this.sanitizeUser(user);
			request.headers['user'] = sanitizedUser;

			return this.checkUserRoles(lowercaseRoles, userRoles);
		} catch (error) {
			console.error('Error validating token:', error);
			return false;
		}
	}

	private extractTokenFromRequest(request: any): string | null {
		const authHeader = request.headers.authorization;
		return authHeader ? authHeader.split(' ')[1] : null;
	}

	private async verifyToken(token: string): Promise<any> {
		const secretKey = process.env.JWT_SECRET || "aLongSecretStringWhoseBitnessIsEqualToOrGreaterThanTheBitnessOfTheTokenEncryptionAlgorithm";
		return this.jwtService.verifyAsync(token, {
			secret: secretKey,
		});
	}

	private isTokenExpired(decodedToken: any): boolean {
		return Date.now() >= decodedToken.exp * 1000;
	}

	private async refreshToken(request: any, decodedToken: any): Promise<void> {
		const userId = decodedToken.sub;
		const user = await this.userRepository.findOne({ where: { id: userId } });

		if (!user || !user.refreshToken) {
			return;
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
		}
	}

	private async getUserFromToken(decodedToken: any): Promise<User | undefined> {
		return this.userRepository.findOne({ where: { id: decodedToken.sub } });
	}

	private sanitizeUser(user: User): any {
		return {
			id: user?.id,
			username: user?.username,
			email: user?.email,
			roles: user?.roles,
			firstName: user?.firstName,
			lastName: user?.lastName,
		};
	}

	private checkUserRoles(lowercaseRoles: string[], userRoles: string[]): boolean {
		return lowercaseRoles.some((role) => userRoles.includes(role));
	}
}
