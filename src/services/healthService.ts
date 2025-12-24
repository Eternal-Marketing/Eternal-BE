import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HealthService {
  async getHealthStatus() {
    // Check database connection
    let dbStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'disconnected';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
    };
  }
}

