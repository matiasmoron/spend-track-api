import { User } from '@/domain/entities/user/User';
import { UserRepository } from '@/domain/repositories/user/UserRepository';

export interface ClaimableGuest {
  userId: number;
  name: string;
}

export async function getClaimableGuests(
  userRepository: UserRepository,
  currentUserEmail: string
): Promise<ClaimableGuest[]> {
  const guests: User[] = await userRepository.findGuestsByClaimEmail(
    currentUserEmail.toLowerCase()
  );

  return guests.map((guest) => ({
    userId: guest.id,
    name: guest.name,
  }));
}
