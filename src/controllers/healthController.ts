import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/healthService';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';

/**
 * 헬스 체크
 * GET /health
 */
export async function check(_req: Request, res: Response, _next: NextFunction) {
  try {
    const healthService = new HealthService();
    const healthStatus = await healthService.getHealthStatus();
    res.status(HttpStatusCodes.OK).json(healthStatus);
  } catch (error) {
    res.status(HttpStatusCodes.SERVICE_UNAVAILABLE).json({
      status: 'error',
      message: 'Service unhealthy',
    });
  }
}
