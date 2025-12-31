import { Router } from 'express';
import * as healthController from '../controllers/healthController';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: 서버 상태 확인
 *     description: 서버와 데이터베이스의 상태를 확인합니다.
 *     responses:
 *       200:
 *         description: 서버 정상 작동
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: 서버 가동 시간 (초)
 *                 environment:
 *                   type: string
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 *       503:
 *         description: 서버 이상
 */
router.get('/', healthController.check);

export { router as healthRouter };
