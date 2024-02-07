import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddGroupRecipientDto {
  @ApiProperty({
    description: 'Username of the user to be added to the group',
    example: 'john_doe',
  })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username: string;
}
