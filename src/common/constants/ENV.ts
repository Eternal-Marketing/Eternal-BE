import dotenv from 'dotenv';

dotenv.config();

const ENV = {
  // Server
  Port: Number(process.env.PORT) || 3000,
  NodeEnv: process.env.NODE_ENV || 'development',
  BaseUrl: process.env.BASE_URL || 'http://localhost:3000',

  // Database
  DbName: process.env.DB_NAME || process.env.DATABASE_NAME || '',
  DbUser: process.env.DB_USER || process.env.DATABASE_USER || '',
  DbPassword: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '',
  DbHost: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
  DbPort: Number(process.env.DB_PORT || process.env.DATABASE_PORT || 3306),

  // JWT
  JwtSecret: process.env.JWT_SECRET || '',
  JwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',

  // Upload
  UploadDir: process.env.UPLOAD_DIR || 'uploads',
};

export default ENV;

