import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditMessageDto {
    @ApiProperty({ description: 'The content of the message', example: 'Updated message content' })
    @IsNotEmpty({ message: 'Content cannot be empty' })
    @IsString({ message: 'Content must be a string' })
    content: string;
}
