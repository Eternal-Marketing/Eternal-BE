/**
 * [당일 진단 건수 표시] 공개 통계 라우트
 * - GET /api/stats/daily-diagnostic-count → 표시용 당일 누적 건수 (인증 없음)
 */
import { Router } from 'express';
import * as statsController from '../controllers/statsController';

const router = Router();

/**
 * @swagger
 * /api/stats/daily-diagnostic-count:
 *   get:
 *     tags: [Stats]
 *     summary: 당일 누적 진단 진행 건수 (표시용)
 *     description: 홈 하단 등에 표시할 당일 누적 진단 건수. 자정 0, 하루가 지남에 따라 설정된 최대값까지 증가. (공개)
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
 *                     count:
 *                       type: integer
 *                       description: 당일 표시용 누적 건수
 */
router.get('/daily-diagnostic-count', statsController.getDailyDiagnosticCount);

export { router as statsRouter };
