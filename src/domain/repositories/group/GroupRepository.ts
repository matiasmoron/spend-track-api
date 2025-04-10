import { Group } from '../../entities/group/Group';

export interface GroupRepository {
  save(group: Partial<Group>): Promise<Group>;
  findById(id: number): Promise<Group | null>;
  findByUserId(userId: number): Promise<Group[]>;
}
