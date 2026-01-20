import { AdminRepo } from '../repositories/adminRepository';
import { AdminRefreshTokenRepo } from '../repositories/adminRefreshTokenRepository';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { AdminRole } from '../models/Admin';

export class AuthService {
  async login(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    admin: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }> {
    const admin = await AdminRepo.findByEmail(email);

    if (!admin || !admin.isActive) {
      const error = new Error('Invalid credentials') as AppError;
      error.statusCode = 401;
      error.status = 'error';
      throw error;
    }

    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid credentials') as AppError;
      error.statusCode = 401;
      error.status = 'error';
      throw error;
    }

    // Update last login
    await AdminRepo.updateLastLogin(admin.id);

    const tokenPayload: TokenPayload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Refresh Token을 DB에 저장

    await AdminRefreshTokenRepo.create({
      adminId: admin.id,
      token: refreshToken,
    });

    return {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  async getAdminById(id: string) {
    const admin = await AdminRepo.findById(id);

    if (!admin) {
      const error = new Error('Admin not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return admin;
  }

  /**
   *
   * @param refreshToken - 클라이언트가 저장하고 있던 Refresh Token (7일 유효)
   * @returns 새로 발급된 Access Token (15분 유효)
   * @throws AppError - Refresh Token이 유효하지 않거나 만료된 경우 401 에러

   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Refresh Token이 제공되지 않은 경우
    if (!refreshToken) {
      const error = new Error('Refresh token is required') as AppError;
      error.statusCode = 401;
      error.status = 'error';
      throw error;
    }

    try {
      const payload: TokenPayload = verifyRefreshToken(refreshToken);

      const storedToken = await AdminRefreshTokenRepo.findByToken(refreshToken);
      if (!storedToken) {
        const error = new Error('Refresh token not found') as AppError;
        error.statusCode = 401;
        error.status = 'error';
        throw error;
      }

      const admin = await AdminRepo.findById(payload.adminId);

      if (!admin || !admin.isActive) {
        // Refresh Token은 유효하지만 어드민 계정이 비활성화된 경우
        const error = new Error('Admin account is inactive') as AppError;
        error.statusCode = 401;
        error.status = 'error';
        throw error;
      }

      const newTokenPayload: TokenPayload = {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      };

      const accessToken = generateAccessToken(newTokenPayload);

      return {
        accessToken,
      };
    } catch (error) {
      // Refresh Token 검증 실패 (만료됨, 서명 불일치, 형식 오류 등)
      // 이 경우 클라이언트는 다시 로그인해야 함
      const appError = new Error(
        'Invalid or expired refresh token'
      ) as AppError;
      appError.statusCode = 401;
      appError.status = 'error';
      throw appError;
    }
  }

  /**
   * 로그아웃 처리
   * - 클라이언트가 가진 Refresh Token을 DB에서 삭제하여 무효화
   * - 토큰이 이미 만료/삭제된 경우에도 "성공"으로 처리 (멱등성)
   *
   * @param refreshToken - 클라이언트가 저장하고 있던 Refresh Token
   * @returns 삭제된 토큰 개수 (0 또는 1)
   */
  async logout(refreshToken: string): Promise<{ deletedCount: number }> {
    if (!refreshToken) {
      const error = new Error('Refresh token is required') as AppError;
      error.statusCode = 400;
      error.status = 'error';
      throw error;
    }

    const deletedCount =
      await AdminRefreshTokenRepo.deleteByToken(refreshToken);

    return { deletedCount };
  }

  /**
   * 어드민 계정 생성
   * @param data - 어드민 생성 데이터
   * @returns 생성된 어드민 정보
   */
  async createAdmin(data: {
    email: string;
    password: string;
    name: string;
    role?: AdminRole | string;
  }) {
    const existingAdmin = await AdminRepo.findByEmail(data.email);

    if (existingAdmin) {
      const error = new Error('Email already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    const hashedPassword = await hashPassword(data.password);

    // role이 유효한 AdminRole인지 확인하고, 아니면 기본값 사용
    const role: AdminRole =
      data.role && Object.values(AdminRole).includes(data.role as AdminRole)
        ? (data.role as AdminRole)
        : AdminRole.EDITOR;

    return await AdminRepo.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role,
    });
  }
}
