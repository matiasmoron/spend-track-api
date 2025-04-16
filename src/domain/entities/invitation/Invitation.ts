export enum InvitationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

export interface InvitationProps {
  id: number;
  groupId: number;
  invitedById: number;
  invitedUserId: number;
  status: InvitationStatus;
  createdAt: Date;
  respondedAt?: Date;
}

export class Invitation {
  readonly id: number;
  readonly groupId: number;
  readonly invitedById: number;
  readonly invitedUserId: number;
  status: InvitationStatus;
  readonly createdAt: Date;
  respondedAt?: Date;

  constructor(props: InvitationProps) {
    this.id = props.id;
    this.groupId = props.groupId;
    this.invitedById = props.invitedById;
    this.invitedUserId = props.invitedUserId;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.respondedAt = props.respondedAt;
  }

  accept(): void {
    this.status = InvitationStatus.Accepted;
    this.respondedAt = new Date();
  }

  reject(): void {
    this.status = InvitationStatus.Rejected;
    this.respondedAt = new Date();
  }
}
