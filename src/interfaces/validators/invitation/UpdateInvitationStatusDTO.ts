import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { InvitationStatus } from '../../../domain/entities/invitation/Invitation';

export class UpdateInvitationStatusDTO {
  @IsNotEmpty({ message: 'Invitation ID is required' })
  @IsInt({ message: 'Invitation ID must be an integer' })
  id!: number;

  @IsEnum([InvitationStatus.Accepted, InvitationStatus.Rejected], {
    message: 'Status must be accepted or rejected',
  })
  status!: InvitationStatus.Accepted | InvitationStatus.Rejected;
}
