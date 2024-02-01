import { Body, Controller, HttpException, HttpStatus, Inject, Post } from '@nestjs/common';
import { Routes, Services } from 'src/common/utils/constrants';
import { IAuthService } from '../services/interface-auth.service';
import { IUserService } from 'src/modules/user/services/impl/interface-user.service';
import { CreateUserDetails } from 'src/common/utils/types';
import { ResponseStatus } from 'src/common/enums/response-status.enum';
import { User } from 'src/modules/user/entities/user.entity';

@Controller(Routes.AUTH)
export class AuthController {
    constructor(
        @Inject(Services.AUTH) private authService: IAuthService,
        @Inject(Services.USER) private userService: IUserService,
    ) { }

    @Post('sign-up')
    async registerUser(@Body() userDetails: CreateUserDetails) {
        try {
            const user: User = await this.authService.signUp(userDetails);

            return {
                data: user,
                code: HttpStatus.OK,
                msg: ResponseStatus.SUCCESSFULLY,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.error('Error in registerUser:', error);
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
