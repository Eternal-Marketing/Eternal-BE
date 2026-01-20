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
 * 사용 시나리오:
 * 1. 사용자가 로그인하여 Access Token(15분)과 Refresh Token(7일)을 받음
 * 2. 15분 후 Access Token이 만료되어 API 호출 시 401 에러 발생
 * 3. 프론트엔드가 자동으로 이 엔드포인트를 호출하여 Refresh Token 전달
 * 4. 유효한 Refresh Token이면 새로운 Access Token(15분) 발급
 * 5. 프론트엔드가 새 Access Token으로 원래 API 호출 재시도
 *
 * 요청 본문:
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // 7일 유효한 Refresh Token
 * }
 *
 * 성공 응답 (200):
 * {
 *   "status": "success",
 *   "data": {
 *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // 새로 발급된 Access Token (15분 유효)
 *   }
 * }
 *
 * 실패 응답 (401):
 * {
 *   "status": "error",
 *   "message": "Invalid or expired refresh token"
 * }
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
