/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, ParseIntPipe, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { Attachment } from 'src/common/utils/types';
import { User } from 'src/modules/user/entities/user.entity';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { EditMessageDto } from '../dtos/edit-message.dto';
import { IMessageService } from '../services/interface-message.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiTags(ApiTagConfigs.MESSAGE)
@ApiBearerAuth()
@Controller(Routes.MESSAGE)
@UseGuards(JwtGuard)
@Roles()
export class MessageController {
    constructor(
        @Inject(Services.MESSAGE) private readonly messageService: IMessageService,
        private eventEmitter: EventEmitter2,
    ) { }

    @ApiOperation({ summary: 'Create a new message' })
    @ApiBadRequestResponse({ description: 'Attachments and content are empty' })
    @UseInterceptors(
        FileFieldsInterceptor([
            {
                name: 'attachments',
                maxCount: 5,
            },
        ]),
    )

    @Post()
    async createMessage(
        @GetUser() user: User,
        @UploadedFiles() files: { attachments?: Attachment[] },
        @Param('id', ParseIntPipe) id: number,
        @Body() { content }: CreateMessageDto,
    ) {
        const attachments = files?.attachments;

        if (!attachments && !content) {
            throw new HttpException('Attachments and content are empty', HttpStatus.BAD_REQUEST);
        }

        const params = { user, id, content, attachments };
        const response = await this.messageService.createMessage(params);
        this.eventEmitter.emit('message.create', response);
        return {
            data: response
        };
    }

    @Get()
    async getMessagesFromConversation(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const messages = await this.messageService.getMessages(id);
        return {
            data: { id, messages }
        };
    }

    @Patch(':messageId')
    async editMessage(
        @GetUser() { id: userId }: User,
        @Param('id') conversationId: number,
        @Param('messageId') messageId: number,
        @Body() { content }: EditMessageDto,
    ) {
        const params = { userId, content, conversationId, messageId };
        const message = await this.messageService.editMessage(params);
        this.eventEmitter.emit('message.update', message);
        return { data: message };
    }


    @Delete(':messageId')
    async deleteMessageFromConversation(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) conversationId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
    ) {
        const params = { userId: user.id, conversationId, messageId };
        await this.messageService.deleteMessage(params);
        this.eventEmitter.emit('message.delete', params);
        return { conversationId, messageId };
    }
}