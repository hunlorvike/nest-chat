import { Body, Controller, Get, Inject, Patch, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { UpdatePresenceStatusDto } from '../dtos/update-presence-status.dto';
import { User } from '../entities/user.entity';
import { IUserPresenceService } from '../services/interface-user-presence.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiTags(ApiTagConfigs.USER_PRESENCE)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Roles()
@Controller(Routes.USER_PRESENCE)
export class UserPresenceController {
    constructor(
        @Inject(Services.USER_PRESENCE)
        private readonly userPresenceService: IUserPresenceService,
        private logger: Logger
    ) { }

    @Patch('status')
    @ApiOperation({ summary: 'Update user status', description: 'Endpoint to update user presence status' })
    @ApiResponse({ status: 200, description: 'Successfully updated user status' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async updateStatus(
        @GetUser() user: User,
        @Body() { statusMessage }: UpdatePresenceStatusDto,
    ) {
        try {
            return await this.userPresenceService.updateStatus({ user, statusMessage });
        } catch (error) {
            this.logger.error(`Error updating user presence status: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
