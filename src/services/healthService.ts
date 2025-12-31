import { sequelize } from '../db';

export class HealthService {
  async getHealthStatus() {
    // Check database connection
    let dbStatus = 'connected';
    try {
      await sequelize.authenticate();
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
