import { Sequelize } from 'sequelize';
import logger from 'jet-logger';
import ENV from '../common/constants/ENV';
import Logger from '../utils/logger';

// 디버그 모드일 때 SQL 쿼리 로깅
const shouldLogQueries =
  process.env.DEBUG === 'true' || ENV.NodeEnv === 'development';

export const sequelize = new Sequelize(ENV.DbName, ENV.DbUser, ENV.DbPassword, {
  host: ENV.DbHost,
  port: ENV.DbPort,
  dialect: 'mysql',
  logging: shouldLogQueries
    ? (sql: string, timing?: number) => {
        Logger.query(sql, timing);
      }
    : false,
  dialectOptions: {
    connectTimeout: 60000, // EC2에서는 socketPath 절대 사용 금지
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    logger.info('✓ DB 연결 성공');
  } catch (err) {
    logger.err('✗ DB 연결 실패');
    logger.err(err as Error, true);
    throw err;
  }
}

export default sequelize;
