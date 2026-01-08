import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';
import ENV from '../common/constants/ENV';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // 에러 로깅
  Logger.error(
    `[${req.method} ${req.originalUrl}] Error ${statusCode}`,
    err,
    ENV.NodeEnv === 'development' || process.env.DEBUG === 'true'
  );

  // 디버그 모드일 때 요청 정보도 함께 로깅
  if (process.env.DEBUG === 'true') {
    Logger.debug('Error Request Details', {
      method: req.method,
      path: req.originalUrl,
      query: req.query,
      body: req.body,
      headers: req.headers,
    });
  }

  res.status(statusCode).json({
    status,
    message: err.message || 'Internal server error',
    ...(ENV.NodeEnv === 'development' && { stack: err.stack }),
    ...(process.env.DEBUG === 'true' && {
      path: req.originalUrl,
      method: req.method,
    }),
  });
};
