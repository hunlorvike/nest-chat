import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFriendDto {
  @ApiProperty({ 
    description: 'The username of the friend to be created.', 
    example: 'john_doe',
  })
  @IsNotEmpty()
  username: string;
}
