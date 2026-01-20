import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 어드민 로그인
 *     description: 이메일과 비밀번호로 로그인하여 JWT 토큰을 받습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: 현재 로그인된 어드민 정보 조회
 *     description: JWT 토큰을 통해 현재 로그인된 어드민의 정보를 조회합니다.
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
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *       401:
 *         description: 인증 실패
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: 액세스 토큰 갱신
 *     description: |
 *       리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.
 *
 *       **사용 시나리오:**
 *       1. 액세스 토큰이 만료되어 API 호출 시 401 에러 발생
 *       2. 프론트엔드가 자동으로 이 엔드포인트를 호출하여 리프레시 토큰 전달
 *       3. 유효한 리프레시 토큰이면 새로운 액세스 토큰(15분 유효) 발급
 *       4. 프론트엔드가 새 액세스 토큰으로 원래 API 호출 재시도
 *
 *       **토큰 수명:**
 *       - 액세스 토큰: 15분 (자주 만료되어 리프레시 필요)
 *       - 리프레시 토큰: 7일 (이 기간 동안 새 액세스 토큰 발급 가능)
 *
 *       **보안:**
 *       - 리프레시 토큰이 만료되면 사용자는 다시 로그인해야 함
 *       - 액세스 토큰 탈취 시 최대 15분만 사용 가능 (보안 강화)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 로그인 시 받은 리프레시 토큰 (7일 유효)
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: 새 액세스 토큰 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: 새로 발급된 액세스 토큰 (15분 유효)
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: 리프레시 토큰이 제공되지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 리프레시 토큰이 유효하지 않거나 만료됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', authController.refreshToken);

export { router as authRouter };
