import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InvitationStatus } from '../../../domain/entities/invitation/Invitation';
import { GroupModel } from './GroupModel';
import { UserModel } from './UserModel';

@Entity('invitations')
export class InvitationModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'group_id' })
  groupId!: number;

  @ManyToOne(() => GroupModel)
  @JoinColumn({ name: 'group_id' })
  group!: GroupModel;

  @Column({ name: 'invited_by_id' })
  invitedById!: number;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'invited_by_id' })
  invitedBy!: UserModel;

  @Column({ name: 'invited_user_id' })
  invitedUserId!: number;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'invited_user_id' })
  invitedUser!: UserModel;

  @Column({ type: 'enum', enum: InvitationStatus })
  status!: InvitationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'responded_at', nullable: true })
  respondedAt?: Date;
}
