import { Controller, Inject, Get, Query, HttpException, HttpStatus, Logger, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/role.decorator";
import { Services, Routes, ApiTagConfigs } from "src/common/utils/constrants";
import { IUserService } from "../services/interface-user.service";
import { JwtGuard } from "src/common/guards/jwt.guard";
import { UserProfileDto } from "../dtos/user-profile.dto";

@ApiTags(ApiTagConfigs.USER)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Roles()
@Controller(Routes.USER)
export class UserController {
    constructor(
        @Inject(Services.USER) private readonly userService: IUserService,
        private readonly logger: Logger,
    ) { }

    @Get('search')
    @ApiOperation({ summary: 'Search users', description: 'Endpoint to search for users' })
    @ApiQuery({ name: 'query', description: 'Search query', required: true })
    @ApiResponse({ status: 200, description: 'Successfully retrieved search results' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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
    @ApiOperation({ summary: 'Check username availability', description: 'Endpoint to check if a username is available' })
    @ApiQuery({ name: 'username', description: 'Username to check', required: true })
    @ApiResponse({ status: 200, description: 'Username is available' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 409, description: 'Username already exists' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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
