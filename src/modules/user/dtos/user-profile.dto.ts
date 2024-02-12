import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({
    description: "User's username (maximum length: 18)",
    maxLength: 18,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(18)
  username: string;

  @ApiProperty({
    description: 'Optional about me section for the user profile',
    maxLength: 200,
    required: false,
  })
  @IsString()
  @MaxLength(200)
  about?: string;
}
