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
 *     description: |
 *       사용자가 상담신청을 제출합니다. 자동으로 가입자로 등록됩니다.
 *       요청 body는 camelCase(SubscriptionFormPayload)를 사용합니다.
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
 *                 description: 담당자명
 *                 example: 홍길동
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일
 *                 example: hong@example.com
 *               phone:
 *                 type: string
 *                 description: 연락처
 *                 example: "010-1234-5678"
 *               companyName:
 *                 type: string
 *                 description: 업체명
 *               industry:
 *                 type: string
 *                 enum: [RESTAURANT, HOSPITAL, ACADEMY, BEAUTY_HEALTH, SHOPPING_MALL, SERVICE, OTHER]
 *                 description: 업종 (단일 선택)
 *               industryOther:
 *                 type: string
 *                 description: 업종 '기타'일 때 직접 입력
 *               concerns:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [SALES_INCREASE, CUSTOMER_ACQUISITION, BRAND_AWARENESS, EFFICIENCY_AND_DIRECTION]
 *                 maxItems: 2
 *                 description: 고민 영역 (최대 2개)
 *               marketingStatus:
 *                 type: string
 *                 enum: [NONE, INTERNAL, OUTSOURCING, SUSPENDED]
 *                 description: 현재 마케팅 진행 상태
 *               interestedChannels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [NAVER_BLOG, NAVER_CAFE, NAVER_SMARTPLACE, INSTAGRAM, YOUTUBE, SHORTFORM_ADS, OTHER]
 *                 description: 관심 마케팅 채널 (복수)
 *               channelsOther:
 *                 type: string
 *                 description: 관심 채널 '기타'일 때 직접 입력
 *               message:
 *                 type: string
 *                 description: 추가 공유 사항
 *                 example: 상담 신청합니다.
 *               region:
 *                 type: string
 *                 description: 지역
 *               contactTimeSlots:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ["09_12", "12_15", "15_18", "18_00", "ANY", "CUSTOM"]
 *                 description: 연락 가능 시간대 (복수)
 *               contactTimeOther:
 *                 type: string
 *                 description: 연락 가능 '특정시간대'일 때 직접 입력
 *     responses:
 *       201:
 *         description: 상담신청 성공
 *       400:
 *         description: 잘못된 요청 (필수값 누락, 이넘 오류, concerns 2개 초과 등)
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
