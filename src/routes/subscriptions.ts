import { Router } from 'express';
import * as subscriptionController from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     tags: [Subscriptions]
 *     summary: 상담신청 생성 (공개 API)
 *     description: 사용자가 상담신청을 제출합니다. 자동으로 가입자로 등록됩니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hong@example.com
 *               phone:
 *                 type: string
 *                 example: 010-1234-5678
 *               message:
 *                 type: string
 *                 example: 상담 신청합니다.
 *     responses:
 *       201:
 *         description: 상담신청 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/', subscriptionController.createSubscription);

/**
 * @swagger
 * /api/subscriptions/count:
 *   get:
 *     tags: [Subscriptions]
 *     summary: 총 가입자 수 조회 (공개 API)
 *     description: |
 *       홈페이지 하단에 표시할 총 가입자 수를 조회합니다.
 *       출범 이전 사용자 수(INITIAL_SUBSCRIBER_COUNT) + 승인된 가입자 수를 반환합니다.
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
 *                     totalCount:
 *                       type: number
 *                       example: 1234
 */
router.get('/count', subscriptionController.getTotalSubscriberCount);

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     tags: [Subscriptions]
 *     summary: 상담신청 목록 조회 (어드민용)
 *     description: 모든 상담신청 목록을 조회합니다. (어드민만)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: 상태 필터
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: 오프셋
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', authenticate, subscriptionController.getSubscriptions);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     tags: [Subscriptions]
 *     summary: 상담신청 상세 조회 (어드민용)
 *     description: 특정 상담신청의 상세 정보를 조회합니다. (어드민만)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 성공
 *       404:
 *         description: 상담신청을 찾을 수 없음
 */
router.get('/:id', authenticate, subscriptionController.getSubscriptionById);

/**
 * @swagger
 * /api/subscriptions/{id}/status:
 *   patch:
 *     tags: [Subscriptions]
 *     summary: 상담신청 상태 업데이트 (어드민용)
 *     description: 상담신청의 상태를 업데이트합니다. (어드민만)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *                 example: APPROVED
 *     responses:
 *       200:
 *         description: 상태 업데이트 성공
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 상담신청을 찾을 수 없음
 */
router.patch(
  '/:id/status',
  authenticate,
  subscriptionController.updateSubscriptionStatus
);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   delete:
 *     tags: [Subscriptions]
 *     summary: 상담신청 삭제 (어드민용)
 *     description: 상담신청을 삭제합니다. (어드민만)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 상담신청을 찾을 수 없음
 */
router.delete('/:id', authenticate, subscriptionController.deleteSubscription);

export { router as subscriptionRouter };
