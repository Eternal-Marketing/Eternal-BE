import { Router } from 'express';
import { ColumnController } from '../controllers/columnController';
import { authenticate } from '../middleware/auth';

const router = Router();
const columnController = new ColumnController();

// Public routes
router.get('/', columnController.getColumns);
router.get('/:id', columnController.getColumnById);
router.get('/slug/:slug', columnController.getColumnBySlug);

// Protected routes (Admin only)
router.use(authenticate);
router.post('/', columnController.createColumn);
router.put('/:id', columnController.updateColumn);
router.delete('/:id', columnController.deleteColumn);
router.patch('/:id/status', columnController.updateStatus);

export { router as columnRouter };

