import { Controller, Get, HttpException, HttpStatus, Inject, Param, ParseIntPipe, UseGuards, Logger } from '@nestjs/common';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { IConversationService } from '../conversations/services/interface-conversation.service';
import { IUserService } from '../user/services/interface-user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { Roles } from 'src/common/decorators/role.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';

@ApiTags(ApiTagConfigs.EXISTS)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Roles()
@Controller(Routes.EXISTS)
export class ExistsController {
    constructor(
        @Inject(Services.CONVERSATION) private readonly conversationService: IConversationService,
        @Inject(Services.USER) private readonly userService: IUserService,
        private readonly events: EventEmitter2,
        private readonly logger: Logger, 
    ) { }

    @Get('conversations/:recipientId')
    async checkConversationExists(
        @GetUser() user: User,
        @Param('recipientId', ParseIntPipe) recipientId: number,
    ) {
        try {
            const conversation = await this.conversationService.isCreated(recipientId, user.id);

            if (conversation) return conversation;

            const recipient = await this.userService.findUser({ id: recipientId });

            if (!recipient) {
                throw new HttpException('Recipient Not Found', HttpStatus.NOT_FOUND);
            }

            const newConversation = await this.conversationService.createConversation(
                user,
                {
                    username: recipient.username,
                    message: 'hello',
                },
            );

            this.events.emit('conversation.create', newConversation);
            return newConversation;
        } catch (error) {
            this.logger.error(`Error in checkConversationExists: ${error.message}`, error.stack, 'ExistsController');
            throw error;
        }
    }
}
