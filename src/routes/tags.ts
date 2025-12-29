import { Router } from 'express';
import { TagController } from '../controllers/tagController';
import { authenticate } from '../middleware/auth';

const router = Router();
const tagController = new TagController();

// Public routes
router.get('/', tagController.getTags);
router.get('/:id', tagController.getTagById);

// Protected routes (Admin only)
router.use(authenticate);
router.post('/', tagController.createTag);
router.delete('/:id', tagController.deleteTag);

export { router as tagRouter };

