import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/modules/user/entities/user.entity';

export const GetUser = createParamDecorator(
	(data: unknown, context: ExecutionContext): User => {
		const request = context.switchToHttp().getRequest();
		return JSON.parse(request.headers.user) as User;
	},
);
