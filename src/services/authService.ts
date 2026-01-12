import { AdminRepo } from '../repositories/adminRepository';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
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
