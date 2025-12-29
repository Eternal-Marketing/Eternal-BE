import { Router } from 'express';
import { PageContentController } from '../controllers/pageContentController';
import { authenticate } from '../middleware/auth';

const router = Router();
const pageContentController = new PageContentController();

// Public routes
router.get('/', pageContentController.getAllContents);
router.get('/:key', pageContentController.getContentByKey);

// Protected routes (Admin only)
router.use(authenticate);
router.put('/:key', pageContentController.updateContent);
router.post('/', pageContentController.upsertContent);

export { router as pageContentRouter };

