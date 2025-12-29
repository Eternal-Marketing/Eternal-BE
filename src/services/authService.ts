import { PrismaClient } from '@prisma/client';
import { AdminRepository } from '../repositories/adminRepository';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository(prisma);
  }

  async login(email: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    admin: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }> {
    const admin = await this.adminRepository.findByEmail(email);

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
    await this.adminRepository.updateLastLogin(admin.id);

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
    const admin = await this.adminRepository.findById(id);

    if (!admin) {
      const error = new Error('Admin not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return admin;
  }

  async createAdmin(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    const existingAdmin = await this.adminRepository.findByEmail(data.email);

    if (existingAdmin) {
      const error = new Error('Email already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    const hashedPassword = await hashPassword(data.password);

    return await this.adminRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role as any || 'EDITOR',
    });
  }
}

