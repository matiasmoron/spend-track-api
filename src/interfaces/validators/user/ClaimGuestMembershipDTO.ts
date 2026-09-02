import { IsInt, IsNotEmpty } from 'class-validator';

export class ClaimGuestMembershipDTO {
  @IsNotEmpty({ message: 'Guest user ID is required' })
  @IsInt({ message: 'Guest user ID must be an integer' })
  guestUserId!: number;
}
