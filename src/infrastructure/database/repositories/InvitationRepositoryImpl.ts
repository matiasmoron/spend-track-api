import { Invitation } from '../../../domain/entities/invitation/Invitation';
import { InvitationStatus } from '../../../domain/entities/invitation/Invitation';
import { InvitationRepository } from '../../../domain/repositories/invitation/InvitationRepository';
import { AppDataSource } from '../../../infrastructure/database/DataSource';
import { InvitationModel } from '../../../infrastructure/database/models/InvitationModel';

export class InvitationRepositoryImpl implements InvitationRepository {
  async create(invitation: Invitation): Promise<Invitation> {
    const repo = AppDataSource.getRepository(InvitationModel);

    const model = repo.create({
      groupId: invitation.groupId,
      invitedById: invitation.invitedById,
      invitedUserId: invitation.invitedUserId,
      status: invitation.status,
      createdAt: invitation.createdAt,
    });

    const saved = await repo.save(model);

    return new Invitation({
      ...invitation,
      id: saved.id,
    });
  }

  async findByUserId(userId: number): Promise<Invitation[]> {
    const repo = AppDataSource.getRepository(InvitationModel);
    const models = await repo.find({
      where: { invitedUserId: userId },
      order: { createdAt: 'ASC' },
    });

    return models.map((m) => new Invitation({ ...m }));
  }

  async findByIdAndUser(id: number, userId: number): Promise<Invitation | null> {
    const repo = AppDataSource.getRepository(InvitationModel);
    const model = await repo.findOne({ where: { id, invitedUserId: userId } });
    return model ? new Invitation({ ...model }) : null;
  }

  async findPendingByGroupAndUser(
    groupId: number,
    invitedUserId: number
  ): Promise<Invitation | null> {
    const repo = AppDataSource.getRepository(InvitationModel);
    const model = await repo.findOne({
      where: {
        groupId,
        invitedUserId,
        status: InvitationStatus.Pending,
      },
    });

    return model ? new Invitation({ ...model }) : null;
  }

  async updateStatus(id: number, status: InvitationStatus): Promise<void> {
    const repo = AppDataSource.getRepository(InvitationModel);
    await repo.update(id, {
      status,
      respondedAt: new Date(),
    });
  }

  async delete(id: number): Promise<void> {
    const repo = AppDataSource.getRepository(InvitationModel);
    await repo.delete(id);
  }
}
