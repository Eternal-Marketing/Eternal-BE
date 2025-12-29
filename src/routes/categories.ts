import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes (Admin only)
router.use(authenticate);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export { router as categoryRouter };

