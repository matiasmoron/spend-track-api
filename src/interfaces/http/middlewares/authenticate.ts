import dotenv from 'dotenv';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../application/errors';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

dotenv.config();

interface DecodedToken {
  id: number;
  email: string;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    if (typeof decoded === 'string' || !decoded.id || !decoded.email) {
      return next(new AppError('Invalid token structure', 401));
    }

    // After check is an authenticated user, I add the user information to the req
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch {
    next(new AppError('Invalid token', 401));
  }
}
