import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_groups')
export class UserGroupModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  groupId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones (opcional si querés lazy loading o relaciones explícitas)
  // @ManyToOne(() => UserModel, user => user.userGroups)
  // @JoinColumn({ name: 'userId' })
  // user: UserModel;

  // @ManyToOne(() => GroupModel, group => group.userGroups)
  // @JoinColumn({ name: 'groupId' })
  // group: GroupModel;
}
