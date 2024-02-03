import { Controller, Get, Inject, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { IConversationService } from '../services/interface-conversation.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreateConversationDto } from '../dtos/create-conversation.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/modules/user/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@ApiTags(ApiTagConfigs.CONVERSATION)
@Controller(Routes.CONVERSATION)
@UseGuards(JwtGuard)
@Roles()
export class ConversationController {
	constructor(
		@Inject(Services.CONVERSATION) private readonly conversationService: IConversationService,
		private readonly events: EventEmitter2,

	) { }

	@Get()
	async getConversations(@GetUser() user: User) {
		return this.conversationService.getConversations(user);
	}

	@Get(':id')
	async getConversationById(@Param('id') id: number) {
		return this.conversationService.findById(id);
	}

	@Post()
	createConversation(@GetUser() user: User, createConversationDto: CreateConversationDto) {
		const conversation = this.conversationService.createConversation(user, createConversationDto);
		this.events.emit('conversation.create', conversation);
		return conversation;
	}
}
