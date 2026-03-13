import { Router } from 'express';
import { sendTestSms } from '../controllers/notificationController';

const router = Router();

/**
 * @swagger
 * /api/notifications/sms/test:
 *   post:
 *     tags: [Notifications]
 *     summary: 테스트용 SMS 발송
 *     description: |
 *       Solapi 연동 확인을 위한 테스트용 SMS 발송 API입니다.
 *       프론트엔드에서 일반 사용자 액션 후 알림을 보내는 용도로 사용할 수 있습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 description: 수신자 번호(숫자만)
 *                 example: "01012345678"
 *               from:
 *                 type: string
 *                 description: |
 *                   발신번호(솔라피에 등록된 번호).
 *                   서버에 SOLAPI_SENDER_NUMBER가 설정되어 있으면 생략 가능하며, 전달 시 동일 번호여야 합니다.
 *                 example: "01098215258"
 *               text:
 *                 type: string
 *                 description: 전송할 메시지 내용 (생략 시 기본 테스트 문구)
 *                 example: "테스트 메시지입니다."
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
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락, 발신번호 불일치 등)
 */
router.post('/sms/test', sendTestSms);

export { router as notificationRouter };
