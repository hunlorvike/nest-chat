import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, ParseIntPipe, Patch, Post, UploadedFiles, UseGuards, UseInterceptors, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { Attachment } from 'src/common/utils/types';
import { CreateMessageDto } from 'src/modules/message/dtos/create-message.dto';
import { EditMessageDto } from 'src/modules/message/dtos/edit-message.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { IGroupMessageService } from '../services/interface-group-message.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiTags(ApiTagConfigs.GROUP_MESSAGE)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Roles()
@Controller(Routes.GROUP_MESSAGE)
export class GroupMessageController {
    constructor(
        @Inject(Services.GROUP_MESSAGE)
        private readonly groupMessageService: IGroupMessageService,
        private readonly eventEmitter: EventEmitter2,
        private readonly logger: Logger, 
    ) { }

    @UseInterceptors(
        FileFieldsInterceptor([
            {
                name: 'attachments',
                maxCount: 5,
            },
        ]),
    )
    @Post()
    async createGroupMessage(
        @GetUser() user: User,
        @UploadedFiles() { attachments }: { attachments: Attachment[] },
        @Param('id', ParseIntPipe) id: number,
        @Body() { content }: CreateMessageDto,
    ) {
        try {
            console.log(`Creating Group Message for ${id}`);
            if (!attachments && !content) {
                throw new HttpException('Empty message', HttpStatus.BAD_REQUEST);
            }

            const params = { groupId: id, author: user, content, attachments };
            const response = await this.groupMessageService.createGroupMessage(params);
            this.eventEmitter.emit('group.message.create', response);

            return;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Error in create group message: ${error.message}`, error.stack, 'GroupMessageController');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    @SkipThrottle()
    async getGroupMessages(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            console.log(`Fetching GroupMessages for Group Id: ${id}`);
            const messages = await this.groupMessageService.getGroupMessages(id);
            return { id, messages };
        } catch (error) {
            this.logger.error(`Error in get group messages: ${error.message}`, error.stack, 'GroupMessageController');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':messageId')
    @SkipThrottle()
    async deleteGroupMessage(
        @GetUser() user: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
    ) {
        try {
            await this.groupMessageService.deleteGroupMessage({
                userId: user.id,
                groupId,
                messageId,
            });
            this.eventEmitter.emit('group.message.delete', {
                userId: user.id,
                messageId,
                groupId,
            });
            return { groupId, messageId };
        } catch (error) {
            this.logger.error(`Error in delete group message: ${error.message}`, error.stack, 'GroupMessageController');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch(':messageId')
    @SkipThrottle()
    async editGroupMessage(
        @GetUser() { id: userId }: User,
        @Param('id', ParseIntPipe) groupId: number,
        @Param('messageId', ParseIntPipe) messageId: number,
        @Body() { content }: EditMessageDto,
    ) {
        try {
            const params = { userId, content, groupId, messageId };
            const message = await this.groupMessageService.editGroupMessage(params);
            this.eventEmitter.emit('group.message.update', message);
            return message;
        } catch (error) {
            this.logger.error(`Error in edit group message: ${error.message}`, error.stack, 'GroupMessageController');
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
