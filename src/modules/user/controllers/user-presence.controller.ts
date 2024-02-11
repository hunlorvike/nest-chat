import { Body, Controller, Get, Inject, Patch, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Routes, Services } from 'src/common/utils/constrants';
import { UpdatePresenceStatusDto } from '../dtos/update-presence-status.dto';
import { User } from '../entities/user.entity';
import { IUserPresenceService } from '../services/interface-user-presence.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@UseGuards(JwtGuard)
@Controller(Routes.USER_PRESENCE)
export class UserPresenceController {
    constructor(
        @Inject(Services.USER_PRESENCE)
        private readonly userPresenceService: IUserPresenceService,
        private logger: Logger
    ) { }

    @Patch('status')
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
