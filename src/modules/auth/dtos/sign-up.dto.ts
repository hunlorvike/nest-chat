import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'User username',
    example: "paylak",
    minLength: 4,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Username should not be empty' })
  @IsString({ message: 'Username should be a string' })
  @MinLength(4, { message: 'Username should be at least 4 characters long' })
  @MaxLength(20, { message: 'Username should not exceed 20 characters' })
  username: string;

  @ApiProperty({
    description: 'User password',
    example: "123456",
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString({ message: 'Password should be a string' })
  @MinLength(6, { message: 'Password should be at least 6 characters long' })
  password: string;

  @ApiProperty({ description: 'User first name', example: 'Nguyễn' })
  @IsNotEmpty({ message: 'First name should not be empty' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: "Văn A" })
  @IsNotEmpty({ message: 'Last name should not be empty' })
  lastName: string;
}
