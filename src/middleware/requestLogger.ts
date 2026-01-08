import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

/**
 * 요청 로깅 미들웨어
 * 모든 API 요청을 로깅하고 응답 시간을 측정
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // 응답이 완료되면 로그 출력
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    Logger.request(method, originalUrl, statusCode, duration);

    // 디버그 모드일 때 추가 정보 출력
    if (process.env.DEBUG === 'true') {
      Logger.debug('Request Details', {
        method,
        path: originalUrl,
        query: req.query,
        body: method !== 'GET' ? req.body : undefined,
        headers: {
          'user-agent': req.get('user-agent'),
          'content-type': req.get('content-type'),
        },
        statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};
