import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateGroupDetailsDto {
  @ApiProperty({
    description: 'New title for the group',
    example: 'Updated Group Title',
    required: false,
  })
  @IsString({ message: 'Title should be a string' })
  title?: string;
}
