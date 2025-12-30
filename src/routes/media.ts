import { Router } from 'express';
import { MediaController } from '../controllers/mediaController';
import { authenticate } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();
const mediaController = new MediaController();

/**
 * @swagger
 * /api/media:
 *   get:
 *     tags: [Media]
 *     summary: 미디어 파일 목록 조회
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: uploadedBy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', mediaController.getMediaList);

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     tags: [Media]
 *     summary: 미디어 파일 상세 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/:id', mediaController.getMediaById);

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     tags: [Media]
 *     summary: 파일 업로드
 *     description: 이미지 파일을 업로드합니다. (어드민만, 최대 5MB)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 이미지 파일 (jpg, png, gif, webp)
 *     responses:
 *       201:
 *         description: 업로드 성공
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
 *                     media:
 *                       $ref: '#/components/schemas/Media'
 *       400:
 *         description: 파일이 없거나 형식이 잘못됨
 */
router.post('/upload', uploadSingle, mediaController.uploadFile);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     tags: [Media]
 *     summary: 미디어 파일 삭제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 삭제 성공
 */
router.delete('/:id', mediaController.deleteMedia);

export { router as mediaRouter };

