import { Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { IConversationService } from '../services/interface-conversation.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreateConversationDto } from '../dtos/create-conversation.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/modules/user/entities/user.entity';

@ApiTags(ApiTagConfigs.CONVERSATION)
@Controller(Routes.CONVERSATION)
@UseGuards(JwtGuard)
@Roles()
export class ConversationController {
    constructor(
        @Inject(Services.CONVERSATION) private readonly conversationService: IConversationService,
    ) { }

    @Get()
    async getAll() { }

    @Post()
    createConversation(@GetUser() user: User, createConversationDto: CreateConversationDto) {
        this.conversationService.createConversation(user, createConversationDto);
    }
}
