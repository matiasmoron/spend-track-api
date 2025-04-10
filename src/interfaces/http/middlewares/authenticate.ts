import dotenv from 'dotenv';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { log } from '../../../shared/utils';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { BaseResponse } from '../utils/BaseResponse';

dotenv.config();

interface DecodedToken {
  id: number;
  email: string;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return BaseResponse.error(res, { message: 'No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    if (typeof decoded === 'string' || !decoded.id || !decoded.email) {
      return BaseResponse.error(res, { message: 'Invalid token structure' }, 401);
    }

    // After check is an authenticated user, I add the user information to the req
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch {
    return BaseResponse.error(res, { message: 'Invalid token' }, 401);
    // return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}
