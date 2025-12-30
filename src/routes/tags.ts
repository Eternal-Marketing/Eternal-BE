import { Router } from 'express';
import { TagController } from '../controllers/tagController';
import { authenticate } from '../middleware/auth';

const router = Router();
const tagController = new TagController();

/**
 * @swagger
 * /api/tags:
 *   get:
 *     tags: [Tags]
 *     summary: 태그 목록 조회
 *     parameters:
 *       - in: query
 *         name: includeCount
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 사용 횟수 포함 여부
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', tagController.getTags);

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     tags: [Tags]
 *     summary: 태그 상세 조회
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
router.get('/:id', tagController.getTagById);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     tags: [Tags]
 *     summary: 태그 생성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: 병원
 *               slug:
 *                 type: string
 *                 example: hospital
 *     responses:
 *       201:
 *         description: 태그 생성 성공
 */
router.post('/', tagController.createTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     tags: [Tags]
 *     summary: 태그 삭제
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
router.delete('/:id', tagController.deleteTag);

export { router as tagRouter };

