import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDTO {
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}
