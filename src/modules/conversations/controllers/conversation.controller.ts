import { Controller, Get, Inject, Post, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiNotFoundResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreateConversationDto } from '../dtos/create-conversation.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/modules/user/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Services, Routes, ApiTagConfigs } from 'src/common/utils/constrants';
import { IConversationService } from '../services/interface-conversation.service';

@ApiTags(ApiTagConfigs.CONVERSATION)
@ApiBearerAuth()
@Controller(Routes.CONVERSATION)
@UseGuards(JwtGuard)
@Roles()
export class ConversationController {
  constructor(
    @Inject(Services.CONVERSATION) private readonly conversationService: IConversationService,
    private readonly events: EventEmitter2,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Returns a list of conversations for the authenticated user' })
  async getConversations(@GetUser() user: User) {
    return this.conversationService.getConversations(user);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns details of a conversation by ID' })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  async getConversationById(@Param('id') id: number) {
    return this.conversationService.findById(id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Creates a new conversation' })
  async createConversation(@GetUser() user: User, @Body() createConversationDto: CreateConversationDto) {
    const conversation = await this.conversationService.createConversation(user, createConversationDto);
    this.events.emit('conversation.create', conversation);

    return conversation;
  }
}
