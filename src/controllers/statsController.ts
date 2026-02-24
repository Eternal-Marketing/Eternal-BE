import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/statsService';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';
import { validateUpdateDailyDiagnosticMaxBody } from '../validators/statsValidator';
import type { AuthRequest } from '../middleware/auth';

export async function getDailyDiagnosticCount(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const statsService = new StatsService();
    const data = await statsService.getDailyDiagnosticCount();
    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDailyDiagnosticMax(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const statsService = new StatsService();
    const data = await statsService.getDailyDiagnosticMax();
    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDailyDiagnosticMax(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.admin) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }
    const validation = validateUpdateDailyDiagnosticMaxBody(req.body);
    if (!validation.success) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: validation.message,
      });
      return;
    }
    const statsService = new StatsService();
    const data = await statsService.setDailyDiagnosticMax(validation.max);
    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}
