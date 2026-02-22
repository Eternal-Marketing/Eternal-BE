import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';
import {
  validateLoginBody,
  validateRefreshTokenBody,
} from '../validators/authValidator';

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
    const validation = validateLoginBody(req.body);
    if (!validation.success) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: validation.message,
      });
      return;
    }

    const authService = new AuthService();
    const result = await authService.login(
      validation.email,
      validation.password
    );

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
 * 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
 *
 * 엔드포인트: POST /api/auth/refresh
 
 *
 * @param req - Express Request 객체
 *   - req.body.refreshToken: 클라이언트가 저장하고 있던 Refresh Token
 * @param res - Express Response 객체
 * @param next - Express NextFunction (에러 처리용)
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = validateRefreshTokenBody(req.body);
    if (!validation.success) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: validation.message,
      });
      return;
    }

    const authService = new AuthService();
    const result = await authService.refreshToken(validation.refreshToken);

    // 새로 발급된 Access Token을 클라이언트에 반환
    // 클라이언트는 이 토큰을 저장하고 이후 API 호출에 사용
    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    // 에러 발생 시 에러 핸들러 미들웨어로 전달
    // - Refresh Token 만료: 401 Unauthorized
    // - 어드민 계정 비활성화: 401 Unauthorized
    // - 기타 에러: 적절한 상태 코드와 메시지
    next(error);
  }
}

/**
 * 로그아웃 (Refresh Token 폐기)
 * POST /api/auth/logout
 *
 * 동작:
 * - 클라이언트가 보낸 Refresh Token을 DB에서 삭제
 * - 토큰이 이미 만료/삭제된 경우에도 성공으로 처리 (멱등)
 *
 * 요청 본문:
 * { "refreshToken": "..." }
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = validateRefreshTokenBody(req.body);
    if (!validation.success) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: validation.message,
      });
      return;
    }

    const authService = new AuthService();
    const result = await authService.logout(validation.refreshToken);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
