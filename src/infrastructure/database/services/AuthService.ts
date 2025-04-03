import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export class AuthService {
  private readonly jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePasswords(password: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(password, hashed);
  }

  generateToken(payload: object, expiresIn: jwt.SignOptions['expiresIn'] = '1H'): string {
    return jwt.sign(payload, this.jwtSecret as jwt.Secret, {
      expiresIn,
    });
  }

  verifyToken<T>(token: string): T {
    return jwt.verify(token, this.jwtSecret) as T;
  }
}
