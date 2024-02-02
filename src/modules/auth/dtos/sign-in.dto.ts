import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'test@gmail.com',
  })
  @IsNotEmpty({ message: 'Username should not be empty' })
  @IsString({ message: 'Username should be a string' })
  @MinLength(4, { message: 'Username should be at least 4 characters long' })
  @MaxLength(20, { message: 'Username should not exceed 20 characters' })
  username: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'Password@123',
  })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString({ message: 'Password should be a string' })
  @MinLength(6, { message: 'Password should be at least 6 characters long' })
  password: string;
}
