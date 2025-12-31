import { Router } from 'express';
import * as pageContentController from '../controllers/pageContentController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/page-content:
 *   get:
 *     tags: [Page Content]
 *     summary: 홈페이지 컨텐츠 목록 조회
 *     description: 모든 홈페이지 컨텐츠를 조회합니다.
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', pageContentController.getAllContents);

/**
 * @swagger
 * /api/page-content/{key}:
 *   get:
 *     tags: [Page Content]
 *     summary: 홈페이지 컨텐츠 조회 (키로)
 *     description: 특정 키의 홈페이지 컨텐츠를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: 컨텐츠 키 (예: main_banner, header_title)
 *         example: main_banner
 *     responses:
 *       200:
 *         description: 성공
 *       404:
 *         description: 컨텐츠를 찾을 수 없음
 */
router.get('/:key', pageContentController.getContentByKey);

/**
 * @swagger
 * /api/page-content/{key}:
 *   put:
 *     tags: [Page Content]
 *     summary: 홈페이지 컨텐츠 수정
 *     description: 특정 키의 홈페이지 컨텐츠를 수정합니다. (어드민만)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [TEXT, HTML, JSON, IMAGE]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 수정 성공
 */
router.put('/:key', authenticate, pageContentController.updateContent);

/**
 * @swagger
 * /api/page-content:
 *   post:
 *     tags: [Page Content]
 *     summary: 홈페이지 컨텐츠 생성/업데이트
 *     description: 컨텐츠가 있으면 업데이트하고, 없으면 생성합니다. (어드민만)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - content
 *               - type
 *             properties:
 *               key:
 *                 type: string
 *                 example: main_banner
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [TEXT, HTML, JSON, IMAGE]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 성공
 */
router.post('/', authenticate, pageContentController.upsertContent);

export { router as pageContentRouter };
