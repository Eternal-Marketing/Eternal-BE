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
    // 요청 본문에서 Refresh Token 추출
    const { refreshToken } = req.body;

    // Refresh Token이 제공되지 않은 경우
    if (!refreshToken) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Refresh token is required',
      });
      return;
    }

    // AuthService를 통해 Refresh Token 검증 및 새 Access Token 발급
    const authService = new AuthService();
    const result = await authService.refreshToken(refreshToken);

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
