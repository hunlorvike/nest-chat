import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCallDto {
    @IsNotEmpty({ message: 'Recipient ID should not be empty' })
    @IsNumber({}, { message: 'Recipient ID should be a number' })
    @ApiProperty({ description: 'The ID of the recipient', type: Number })
    recipientId: number;

    @IsNotEmpty({ message: 'Conversation ID should not be empty' })
    @IsNumber({}, { message: 'Conversation ID should be a number' })
    @ApiProperty({ description: 'The ID of the conversation', type: Number })
    conversationId: number;
}
