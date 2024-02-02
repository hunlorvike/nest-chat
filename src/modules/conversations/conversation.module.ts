import { ConversationService } from './services/conversation.service';
import { ConversationController } from './controllers/conversation.controller';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [
        ConversationController
    ],
    providers: [
        ConversationService
    ],
})
export class ConversationModule { }
