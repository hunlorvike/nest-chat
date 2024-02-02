import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { IAuthService } from '../services/interface-auth.service';
import { IUserService } from 'src/modules/user/services/interface-user.service';
import { CreateUserDetails } from 'src/common/utils/types';
import { ResponseStatus } from 'src/common/enums/response-status.enum';
import { User } from 'src/modules/user/entities/user.entity';
import { SignUpDto } from '../dtos/sign-up.dto';
import { SignInDto } from '../dtos/sign-in.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiTags(ApiTagConfigs.AUTH)
@ApiBearerAuth()
@Controller(Routes.AUTH)
export class AuthController {
    constructor(
        @Inject(Services.AUTH) private authService: IAuthService,
        @Inject(Services.USER) private userService: IUserService,
    ) { }

    @Get('check-memory')
    async checkMemory() {
        const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;

        return {
            data: memoryUsed,
            message: `Node.js is using approximately ${Math.round(memoryUsed * 100) / 100} MB`,
        };
    }

    @Get('check-user-by-token')
    @UseGuards(JwtGuard)
    @Roles()
    async checkUser(@GetUser() user: User) {
        return {
            data: user || null,
            code: HttpStatus.OK,
            message: ResponseStatus.SUCCESSFULLY,
        }
    }


    @Post('sign-in')
    async signIn(@Body() signInDto: SignInDto) {
        try {
            const { accessToken } = await this.authService.signIn(signInDto);

            return {
                data: { accessToken },
                code: HttpStatus.OK,
                message: ResponseStatus.SUCCESSFULLY,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.error('Error in signIn:', error);
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    @Post('sign-up')
    async registerUser(@Body() signUpDto: SignUpDto) {
        try {
            const user: User = await this.authService.signUp(signUpDto);

            return {
                data: user,
                code: HttpStatus.OK,
                message: ResponseStatus.SUCCESSFULLY,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.error('Error in registerUser:', error);
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
