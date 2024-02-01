import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly jwtService: JwtService,
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

			const isExpired = Date.now() >= decodedToken.exp * 1000;

			if (isExpired) {
				return false;
			}

			const lowercaseRoles = roles.map((role) => role.toLowerCase());
			const userRoles = decodedToken.role.map((role) => role.toLowerCase());

			return lowercaseRoles.some((role) => userRoles.includes(role));
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}