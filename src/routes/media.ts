import { Router } from 'express';
import { MediaController } from '../controllers/mediaController';
import { authenticate } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();
const mediaController = new MediaController();

// Public routes
router.get('/', mediaController.getMediaList);
router.get('/:id', mediaController.getMediaById);

// Protected routes (Admin only)
router.use(authenticate);
router.post('/upload', uploadSingle, mediaController.uploadFile);
router.delete('/:id', mediaController.deleteMedia);

export { router as mediaRouter };

