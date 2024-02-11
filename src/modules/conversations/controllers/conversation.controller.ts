import { Controller, Get, Inject, Post, Param, UseGuards, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiNotFoundResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreateConversationDto } from '../dtos/create-conversation.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/modules/user/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Services, Routes, ApiTagConfigs } from 'src/common/utils/constrants';
import { IConversationService } from '../services/interface-conversation.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

@ApiTags(ApiTagConfigs.CONVERSATION)
@ApiBearerAuth()
@Controller(Routes.CONVERSATION)
@UseGuards(JwtGuard)
@Roles()
@SkipThrottle()
export class ConversationController {
	constructor(
		@Inject(Services.CONVERSATION) private readonly conversationService: IConversationService,
		private readonly events: EventEmitter2,
		private readonly logger: Logger,
	) { }

	@Get()
	@ApiOkResponse({ description: 'Returns a list of conversations for the authenticated user' })
	async getConversations(@GetUser() user: User) {
		try {
			const data = await this.conversationService.getConversations(user);
			return { data: data };
		} catch (error) {
			this.logger.error(`Error in getConversations: ${error.message}`, error.stack, 'ConversationController');
			throw new HttpException('Internal Server Error', 500);
		}
	}

	@Get(':id')
	@ApiOkResponse({ description: 'Returns details of a conversation by ID' })
	@ApiNotFoundResponse({ description: 'Conversation not found' })
	async getConversationById(@Param('id') id: number) {
		try {
			const data = await this.conversationService.findById(id);
			return {
				data: data
			}
		} catch (error) {
			this.logger.error(`Error in getConversationById: ${error.message}`, error.stack, 'ConversationController');
			throw new HttpException('Internal Server Error', 500);
		}
	}

	@Post()
	@ApiCreatedResponse({ description: 'Creates a new conversation' })
	async createConversation(@GetUser() user: User, @Body() createConversationDto: CreateConversationDto) {
		try {
			const conversation = await this.conversationService.createConversation(user, createConversationDto);
			this.events.emit('conversation.create', conversation);

			return conversation;
		} catch (error) {
			this.logger.error(`Error in createConversation: ${error.message}`, error.stack, 'ConversationController');
			throw new HttpException('Internal Server Error', 500);
		}
	}
}
