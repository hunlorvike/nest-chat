import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IUserService } from '../interface-user.service';
import { CreateUserDetails, FindUserOptions, FindUserParams } from 'src/common/utils/types';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { hashPassword } from 'src/common/utils/helpers';
import { Peer } from '../../entities/peer.entity';

@Injectable()
export class UserService implements IUserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Peer) private readonly peerRepository: Repository<Peer>,
        private readonly logger: Logger,
    ) { }

    async createUser(userDetails: CreateUserDetails) {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { username: userDetails.username },
            });

            if (existingUser) {
                throw new HttpException('User already exists', HttpStatus.CONFLICT);
            }

            const password = await hashPassword(userDetails.password);
            const peer = this.peerRepository.create();
            const params = { ...userDetails, password, peer };
            const newUser = this.userRepository.create(params);

            return this.userRepository.save(newUser);
        } catch (error) {
            this.logger.error(`Error creating user: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findUser(params: FindUserParams, options?: FindUserOptions): Promise<User> {
        try {
            const selections: (keyof User)[] = ['email', 'username', 'firstName', 'lastName', 'id'];
            const selectionsWithPassword: (keyof User)[] = [...selections, 'password'];

            const queryOptions: FindOneOptions<User> = {
                where: params,
                select: options?.selectAll ? selectionsWithPassword : selections,
                relations: ['profile', 'presence', 'peer'],
            };

            return this.userRepository.findOne(queryOptions);
        } catch (error) {
            this.logger.error(`Error finding user: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async saveUser(user: User) {
        try {
            return this.userRepository.save(user);
        } catch (error) {
            this.logger.error(`Error saving user: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    searchUsers(query: string) {
        try {
            const statement = '(user.username LIKE :query)';
            return this.userRepository
                .createQueryBuilder('user')
                .where(statement, { query: `%${query}%` })
                .limit(10)
                .select([
                    'user.username',
                    'user.firstName',
                    'user.lastName',
                    'user.email',
                    'user.id',
                    'user.profile',
                ])
                .getMany();
        } catch (error) {
            this.logger.error(`Error searching users: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
