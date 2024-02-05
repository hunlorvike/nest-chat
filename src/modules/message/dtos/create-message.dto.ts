import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @ApiProperty({ description: 'The content of the message', example: 'Hello, world!' })
    @IsNotEmpty({ message: 'Content cannot be empty' })
    @IsString({ message: 'Content must be a string' })
    content: string;
}
