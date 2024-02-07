import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class TransferOwnerDto {
  @ApiProperty({
    description: 'ID of the new owner',
    example: 123,
  })
  @IsNotEmpty({ message: 'New owner ID cannot be empty' })
  @IsNumber({}, { message: 'New owner ID should be a number' })
  newOwnerId: number;
}
