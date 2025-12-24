import { Request, Response } from 'express';
import { HealthService } from '../services/healthService';

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  check = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthStatus = await this.healthService.getHealthStatus();
      res.status(200).json(healthStatus);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: 'Service unhealthy',
      });
    }
  };
}

