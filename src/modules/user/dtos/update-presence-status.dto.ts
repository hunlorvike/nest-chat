import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePresenceStatusDto {
  @ApiProperty({
    description: 'Status message for the user presence',
    example: 'Available',
  })
  @IsNotEmpty()
  @IsString()
  statusMessage: string;
}
