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
		const token = request.headers.authorization;

		if (!token) {
			return false;
		}

		try {
			const secretKey = process.env.JWT_SECRET || "aLongSecretStringWhoseBitnessIsEqualToOrGreaterThanTheBitnessOfTheTokenEncryptionAlgorithm";
			const decodedToken = await this.jwtService.verifyAsync(token, {
				secret: secretKey,
			});

			if (!decodedToken || !decodedToken.role || !Array.isArray(decodedToken.role)) {
				return false;
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
						// Use refreshToken to generate a new access token
						const newToken = await this.authService.generateAccessTokenFromRefreshToken(refreshToken);

						// Update the authorization header with the new token
						if (newToken && newToken.accessToken) {
							request.headers.authorization = `Bearer ${newToken.accessToken}`;

							// Store user information in the request
							request.headers['user'] = JSON.stringify(user);
							return true;
						}
					} catch (refreshTokenError) {
						console.error('Error generating access token from refresh token:', refreshTokenError);
					}
				}

				return false;
			}

			const lowercaseRoles = roles.map((role) => role.toLowerCase());
			const userRoles = decodedToken.role.map((role) => role.toLowerCase());

			const user = await this.userRepository.findOne({ where: { id: decodedToken.sub } });

			// Store user information in the request
			request.headers['user'] = JSON.stringify(user);
			return lowercaseRoles.some((role) => userRoles.includes(role));
		} catch (error) {
			console.error('Error validating token:', error);
			return false;
		}
	}
}
