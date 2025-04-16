import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateInvitationDTO {
  @IsNotEmpty({ message: 'Group ID is required' })
  @IsInt({ message: 'Group ID must be an integer' })
  groupId!: number;

  @IsNotEmpty({ message: 'User ID is required' })
  @IsInt({ message: 'User ID must be an integer' })
  invitedUserId!: number;
}
