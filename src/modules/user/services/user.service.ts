/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IUserService } from './impl/interface-user.service';
import { CreateUserDetails, FindUserOptions, FindUserParams, ValidateUserDetails } from 'src/common/utils/types';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { hashPassword } from 'src/common/utils/helpers';

@Injectable()
export class UserService implements IUserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) { }

    async findUser(params: FindUserParams, options?: FindUserOptions): Promise<User> {
        const selections: (keyof User)[] = [
            'email',
            'username',
            'firstName',
            'lastName',
            'id',
        ];
        const selectionsWithPassword: (keyof User)[] = [...selections, 'password'];

        const queryOptions: FindOneOptions<User> = {
            where: params,
            select: options?.selectAll ? selectionsWithPassword : selections,
            relations: ['profile', 'presence', 'peer'],
        };

        return this.userRepository.findOne(queryOptions);
    }

}
