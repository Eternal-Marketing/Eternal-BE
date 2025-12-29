import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/refresh', authController.refreshToken);

export { router as authRouter };

