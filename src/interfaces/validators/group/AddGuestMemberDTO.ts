import { IsEmail, IsInt, IsNotEmpty, IsString, MaxLength, ValidateIf } from 'class-validator';

export class AddGuestMemberDTO {
  @IsNotEmpty({ message: 'Group ID is required' })
  @IsInt({ message: 'Group ID must be an integer' })
  groupId!: number;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name must be shorter than or equal to 200 characters' })
  name!: string;

  @ValidateIf((o) => o.claimEmail !== undefined && o.claimEmail !== '')
  @IsEmail({}, { message: 'Claim email must be valid' })
  claimEmail?: string;
}
