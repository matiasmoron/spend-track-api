import { Invitation } from '../../../domain/entities/invitation/Invitation';
import { InvitationStatus } from '../../../domain/entities/invitation/Invitation';

export interface InvitationRepository {
  create(invitation: Invitation): Promise<Invitation>;

  findByUserId(userId: number): Promise<Invitation[]>;

  findByIdAndUser(id: number, userId: number): Promise<Invitation | null>;

  findPendingByGroupAndUser(groupId: number, invitedUserId: number): Promise<Invitation | null>;

  updateStatus(id: number, status: InvitationStatus): Promise<void>;

  delete(id: number): Promise<void>;
}
