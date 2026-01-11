import logger from 'jet-logger';
import ENV from '../common/constants/ENV';

/**
 * 로거 유틸리티
 * 개발 환경에서는 상세한 로그를, 프로덕션에서는 최소한의 로그만 출력
 */
class Logger {
  private isDevelopment = ENV.NodeEnv === 'development';
  private isDebug = process.env.DEBUG === 'true';

  /**
   * 일반 정보 로그
   */
  info(message: string, data?: unknown): void {
    if (this.isDevelopment || this.isDebug) {
      if (data) {
        logger.info(`${message}`, data);
      } else {
        logger.info(message);
      }
    }
  }

  /**
   * 경고 로그
   */
  warn(message: string, data?: unknown): void {
    if (data) {
      logger.warn(`${message}`, data);
    } else {
      logger.warn(message);
    }
  }

  /**
   * 에러 로그
   */
  error(message: string, error?: Error | unknown, fullStack = false): void {
    if (error instanceof Error) {
      logger.err(`${message}: ${error.message}`, fullStack);
      if (this.isDevelopment || this.isDebug) {
        logger.err(error.stack || '', false);
      }
    } else if (error) {
      logger.err(`${message}`, fullStack);
      if (this.isDevelopment || this.isDebug) {
        logger.err(JSON.stringify(error, null, 2), false);
      }
    } else {
      logger.err(message, fullStack);
    }
  }

  /**
   * 디버그 로그 (DEBUG=true일 때만)
   */
  debug(message: string, data?: unknown): void {
    if (this.isDebug) {
      if (data) {
        logger.info(`[DEBUG] ${message}`, data);
      } else {
        logger.info(`[DEBUG] ${message}`);
      }
    }
  }

  /**
   * API 요청 로그
   */
  request(
    method: string,
    path: string,
    statusCode: number,
    duration?: number
  ): void {
    const durationStr = duration ? ` (${duration}ms)` : '';
    const statusEmoji =
      statusCode >= 500 ? '🔴' : statusCode >= 400 ? '🟡' : '🟢';
    logger.info(
      `${statusEmoji} ${method} ${path} - ${statusCode}${durationStr}`
    );
  }

  /**
   * 데이터베이스 쿼리 로그
   */
  query(sql: string, duration?: number): void {
    if (this.isDebug) {
      const durationStr = duration ? ` (${duration}ms)` : '';
      logger.info(`[DB Query]${durationStr} ${sql}`);
    }
  }
}

export default new Logger();
