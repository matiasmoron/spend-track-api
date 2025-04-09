import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}
