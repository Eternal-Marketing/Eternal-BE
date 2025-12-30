import { Router } from 'express';
import * as columnController from '../controllers/columnController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/columns:
 *   get:
 *     tags: [Columns]
 *     summary: 칼럼 목록 조회
 *     description: 칼럼 목록을 페이지네이션과 필터링 옵션으로 조회합니다.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, PRIVATE]
 *         description: 칼럼 상태
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: 카테고리 ID
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: string
 *         description: 태그 ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색 키워드
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [createdAt, publishedAt, viewCount, title]
 *           default: createdAt
 *         description: 정렬 기준
 *       - in: query
 *         name: orderDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 정렬 방향
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
 *                     columns:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Column'
 *                     pagination:
 *                       type: object
 */
router.get('/', columnController.getColumns);

/**
 * @swagger
 * /api/columns/{id}:
 *   get:
 *     tags: [Columns]
 *     summary: 칼럼 상세 조회 (ID)
 *     description: ID로 칼럼의 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 칼럼 ID
 *       - in: query
 *         name: incrementView
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 조회수 증가 여부
 *     responses:
 *       200:
 *         description: 성공
 *       404:
 *         description: 칼럼을 찾을 수 없음
 */
router.get('/:id', columnController.getColumnById);

/**
 * @swagger
 * /api/columns/slug/{slug}:
 *   get:
 *     tags: [Columns]
 *     summary: 칼럼 상세 조회 (Slug)
 *     description: Slug로 칼럼의 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: 칼럼 Slug
 *       - in: query
 *         name: incrementView
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 조회수 증가 여부
 *     responses:
 *       200:
 *         description: 성공
 *       404:
 *         description: 칼럼을 찾을 수 없음
 */
router.get('/slug/:slug', columnController.getColumnBySlug);

/**
 * @swagger
 * /api/columns:
 *   post:
 *     tags: [Columns]
 *     summary: 칼럼 생성
 *     description: 새로운 칼럼을 생성합니다. (어드민만)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: 병원 마케팅 전략
 *               slug:
 *                 type: string
 *                 example: hospital-marketing-strategy
 *               content:
 *                 type: string
 *                 example: 칼럼 본문 내용...
 *               excerpt:
 *                 type: string
 *                 example: 칼럼 요약
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, PRIVATE]
 *                 default: DRAFT
 *               categoryId:
 *                 type: string
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 칼럼 생성 성공
 *       401:
 *         description: 인증 필요
 */
router.post('/', authenticate, columnController.createColumn);

/**
 * @swagger
 * /api/columns/{id}:
 *   put:
 *     tags: [Columns]
 *     summary: 칼럼 수정
 *     description: 기존 칼럼을 수정합니다. (어드민만)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, PRIVATE]
 *               categoryId:
 *                 type: string
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *       404:
 *         description: 칼럼을 찾을 수 없음
 */
router.put('/:id', authenticate, columnController.updateColumn);

/**
 * @swagger
 * /api/columns/{id}:
 *   delete:
 *     tags: [Columns]
 *     summary: 칼럼 삭제
 *     description: 칼럼을 삭제합니다. (어드민만)
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
 *       404:
 *         description: 칼럼을 찾을 수 없음
 */
router.delete('/:id', authenticate, columnController.deleteColumn);

/**
 * @swagger
 * /api/columns/{id}/status:
 *   patch:
 *     tags: [Columns]
 *     summary: 칼럼 상태 변경
 *     description: 칼럼의 상태를 변경합니다. (어드민만)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 enum: [DRAFT, PUBLISHED, PRIVATE]
 *     responses:
 *       200:
 *         description: 상태 변경 성공
 */
router.patch('/:id/status', authenticate, columnController.updateStatus);

export { router as columnRouter };

