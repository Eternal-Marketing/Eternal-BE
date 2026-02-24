/**
 * [당일 진단 건수 표시] 설정 라우트 (어드민)
 * - GET/PATCH /api/settings/daily-diagnostic-max (authenticate)
 */
import { Router } from 'express';
import * as statsController from '../controllers/statsController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/settings/daily-diagnostic-max:
 *   get:
 *     tags: [Settings]
 *     summary: 당일 진단 표시 최대값 조회
 *     description: 당일 누적 진단 건수가 증가할 수 있는 최대값. (어드민)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     max:
 *                       type: integer
 *       401:
 *         description: 인증 필요
 */
router.get(
  '/daily-diagnostic-max',
  authenticate,
  statsController.getDailyDiagnosticMax
);

/**
 * @swagger
 * /api/settings/daily-diagnostic-max:
 *   patch:
 *     tags: [Settings]
 *     summary: 당일 진단 표시 최대값 변경
 *     description: 홈에 표시되는 당일 최대 건수를 변경. 0~999. (어드민)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - max
 *             properties:
 *               max:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 999
 *                 example: 20
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     max:
 *                       type: integer
 *       400:
 *         description: 잘못된 요청 (max 범위 등)
 *       401:
 *         description: 인증 필요
 */
router.patch(
  '/daily-diagnostic-max',
  authenticate,
  statsController.updateDailyDiagnosticMax
);

export { router as settingsRouter };
