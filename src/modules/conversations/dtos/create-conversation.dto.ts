import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ 
    description: 'The username of the conversation participant.', 
    example: 'john_doe',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ 
    description: 'The message content of the conversation.', 
    example: 'Hello, how are you?',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
