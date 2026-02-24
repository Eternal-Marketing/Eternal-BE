import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { columnRouter } from './routes/columns';
import { categoryRouter } from './routes/categories';
import { pageContentRouter } from './routes/pageContent';
import { mediaRouter } from './routes/media';
import { subscriptionRouter } from './routes/subscriptions';
import { statsRouter } from './routes/stats';
import { settingsRouter } from './routes/settings';
import { connectDB } from './db';
import './models'; // Initialize models and associations
import ENV from './common/constants/ENV';

//서버 실행 시 가장 먼저 실행되는 곳!

const app: Express = express();
const PORT = ENV.Port;
const UPLOAD_DIR = ENV.UploadDir;

// Middleware
app.use(
  cors({
    origin: true, // 모든 origin 허용
    credentials: true, // 쿠키/인증 정보 허용
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (모든 요청 로깅)
app.use(requestLogger);

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Eternal Backend API Documentation',
  })
);

// Serve uploaded files statically
app.use(`/${UPLOAD_DIR}`, express.static(path.join(process.cwd(), UPLOAD_DIR)));

// API Routes
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/columns', columnRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/page-content', pageContentRouter);
app.use('/api/media', mediaRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/stats', statsRouter); // [당일 진단 건수] GET /daily-diagnostic-count (공개)
app.use('/api/settings', settingsRouter); // [당일 진단 건수] GET/PATCH /daily-diagnostic-max (어드민)

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Eternal Backend API',
    version: '1.0.0',
    docs: '/api-docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      columns: '/api/columns',
      categories: '/api/categories',
      pageContent: '/api/page-content',
      media: '/api/media',
      subscriptions: '/api/subscriptions',
      stats: '/api/stats',
      settings: '/api/settings',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * 서버 시작 함수
 * DB 연결 후 Express 서버를 시작합니다.
 */
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${ENV.NodeEnv}`);
      console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
