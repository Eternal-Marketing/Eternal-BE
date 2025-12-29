import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  admin?: TokenPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authentication required') as AppError;
      error.statusCode = 401;
      error.status = 'error';
      throw error;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyAccessToken(token);
      req.admin = decoded;
      next();
    } catch (error) {
      const appError = new Error('Invalid or expired token') as AppError;
      appError.statusCode = 401;
      appError.status = 'error';
      throw appError;
    }
  } catch (error) {
    next(error);
  }
};

// 역할 기반 인가 미들웨어 (선택사항)
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      const error = new Error('Authentication required') as AppError;
      error.statusCode = 401;
      error.status = 'error';
      return next(error);
    }

    if (!allowedRoles.includes(req.admin.role)) {
      const error = new Error('Insufficient permissions') as AppError;
      error.statusCode = 403;
      error.status = 'error';
      return next(error);
    }

    next();
  };
};

