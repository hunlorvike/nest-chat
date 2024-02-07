import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Array of usernames for users to be added to the group',
    example: ['john_doe', 'jane_doe'],
    isArray: true,
  })
  @IsString({ each: true, message: 'Each user should be a string' })
  @ArrayNotEmpty({ message: 'Users array cannot be empty' })
  users: string[];

  @ApiProperty({
    description: 'Title of the group',
    example: 'Awesome Group',
  })
  @IsString({ message: 'Title should be a string' })
  title: string;
}
