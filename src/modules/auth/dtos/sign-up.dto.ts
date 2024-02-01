import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty({ message: 'Username should not be empty' })
  @IsString({ message: 'Username should be a string' })
  @MinLength(4, { message: 'Username should be at least 4 characters long' })
  @MaxLength(20, { message: 'Username should not exceed 20 characters' })
  username: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  @IsString({ message: 'Password should be a string' })
  @MinLength(6, { message: 'Password should be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'First name should not be empty' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name should not be empty' })
  lastName: string;
}
