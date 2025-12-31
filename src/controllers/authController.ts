import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';

/**
 * 어드민 로그인
 * POST /api/auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Email and password are required',
      });
      return;
    }

    const authService = new AuthService();
    const result = await authService.login(email, password);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 현재 로그인된 어드민 정보 조회
 * GET /api/auth/me
 */
export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const authService = new AuthService();
    const admin = await authService.getAdminById(req.admin.adminId);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { admin },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 토큰 갱신 (구현 예정)
 * POST /api/auth/refresh
 */
export async function refreshToken(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      message: 'Token refresh endpoint - to be implemented',
    });
  } catch (error) {
    next(error);
  }
}
