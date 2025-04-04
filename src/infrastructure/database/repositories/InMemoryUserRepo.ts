import { User } from '@/domain/entities/User';
import { UserRepository } from '@/domain/repositories/UserRepository';

export class InMemoryUserRepo implements UserRepository {
  private users: User[] = [];
  private idCounter = 1;

  async save(user: User): Promise<User> {
    const newUser = new User({
      ...user,
      id: this.idCounter++,
    });

    this.users.push(newUser);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(newUser);
      }, 1000);
    });
  }

  async getByEmail(email: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.users.find((u) => u.email === email) || null);
      }, 1000);
    });
  }

  async getById(id: number): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.users.find((u) => u.id === id) || null);
      }, 1000);
    });
  }
}
