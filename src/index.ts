import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { columnRouter } from './routes/columns';
import { categoryRouter } from './routes/categories';
import { tagRouter } from './routes/tags';
import { pageContentRouter } from './routes/pageContent';
import { mediaRouter } from './routes/media';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Eternal Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      columns: '/api/columns',
      categories: '/api/categories',
      tags: '/api/tags',
      pageContent: '/api/page-content',
      media: '/api/media',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
});

export default app;

