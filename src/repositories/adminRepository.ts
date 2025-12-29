import { PrismaClient, Admin, Prisma } from '@prisma/client';

export class AdminRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<Admin | null> {
    return await this.prisma.admin.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<Admin | null> {
    return await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: Prisma.AdminRole;
  }): Promise<Admin> {
    return await this.prisma.admin.create({
      data,
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.admin.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

