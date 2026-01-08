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
import { tagRouter } from './routes/tags';
import { pageContentRouter } from './routes/pageContent';
import { mediaRouter } from './routes/media';
import { subscriptionRouter } from './routes/subscriptions';
import { connectDB } from './db';
import './models'; // Initialize models and associations
import ENV from './common/constants/ENV';

const app: Express = express();
const PORT = ENV.Port;
const UPLOAD_DIR = ENV.UploadDir;

// Middleware
app.use(cors());
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
app.use('/api/tags', tagRouter);
app.use('/api/page-content', pageContentRouter);
app.use('/api/media', mediaRouter);
app.use('/api/subscriptions', subscriptionRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Eternal Backend API',
    version: '1.0.0',
    docs: '/api-docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      columns: '/api/columns',
      categories: '/api/categories',
      tags: '/api/tags',
      pageContent: '/api/page-content',
      media: '/api/media',
      subscriptions: '/api/subscriptions',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
(async () => {
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
})();

export default app;
