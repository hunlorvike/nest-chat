import { MessageController } from './controllers/message.controller';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [
        MessageController,
    ],
    providers: [],
})
export class MessageModule { }
