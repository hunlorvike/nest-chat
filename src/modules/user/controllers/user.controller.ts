import { Controller, Inject, Get, Query, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Routes, Services } from "src/common/utils/constrants";
import { IUserService } from "../services/interface-user.service";

@Controller(Routes.USER)
export class UserController {
    constructor(
        @Inject(Services.USER) private readonly userService: IUserService,
        private readonly logger: Logger,
    ) { }

    @Get('search')
    async searchUsers(@Query('query') query: string) {
        try {
            console.log(query);
            if (!query) {
                throw new HttpException('Provide a valid query', HttpStatus.BAD_REQUEST);
            }
            return await this.userService.searchUsers(query);
        } catch (error) {
            this.logger.error(`Error in searchUsers: ${error.message}`, error.stack, 'UsersController');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('check')
    async checkUsername(@Query('username') username: string) {
        try {
            if (!username) {
                throw new HttpException('Invalid Query', HttpStatus.BAD_REQUEST);
            }
            const user = await this.userService.findUser({ username });
            if (user) {
                throw new HttpException('User already exists', HttpStatus.CONFLICT);
            }
            return HttpStatus.OK;
        } catch (error) {
            this.logger.error(`Error in checkUsername: ${error.message}`, error.stack, 'UsersController');
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
