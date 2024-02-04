import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/modules/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export const GetUser = () => {
	const jwtService = new JwtService();

	return createParamDecorator(
		async (data: unknown, context: ExecutionContext): Promise<User | boolean> => {
			const request = context.switchToHttp().getRequest();
			if (request.headers.user) {
				return request.headers.user as User;
			}

			const authorizationHeader = request.headers.authorization;

			if (authorizationHeader && authorizationHeader.startsWith('Bearer')) {
				const authorizationNewHeader = authorizationHeader.split('Bearer ')[1];

				const secretKey = process.env.JWT_SECRET || "aLongSecretStringWhoseBitnessIsEqualToOrGreaterThanTheBitnessOfTheTokenEncryptionAlgorithm";
				try {
					const decodedToken = await jwtService.verifyAsync(authorizationNewHeader, {
						secret: secretKey,
					});

					const isTokenExpired = Date.now() >= decodedToken.exp * 1000;

					if (isTokenExpired) {
						const userRepository: Repository<User> = context.switchToHttp().getRequest().app.get('UserRepository');
						const username = decodedToken.username; 

						if (!username) {
							return false;
						}

						const user = await userRepository.findOne({ where: { username: username } });

						if (!user) {
							return false;
						}
						return user as User;
					}

					return decodedToken as User;
				} catch (error) {
					throw new UnauthorizedException('Invalid token');
				}
			}

			throw new UnauthorizedException('User not authenticated');
		},
	)();
};
