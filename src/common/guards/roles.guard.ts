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
		const token = request.headers.authorization.split(' ')[1];

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
				const username = decodedToken.sub;

				const user = await this.userRepository.findOne({ where: { username: username } });

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
					}
				}

				return false;
			}

			const lowercaseRoles = roles.map((role) => role.toLowerCase());
			const userRoles = decodedToken.role.map((role) => role.toLowerCase());

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
			return lowercaseRoles.some((role) => userRoles.includes(role));
		} catch (error) {
			console.error('Error validating token:', error);
			return false;
		}
	}
}
