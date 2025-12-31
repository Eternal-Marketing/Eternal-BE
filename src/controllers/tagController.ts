import { Request, Response, NextFunction } from 'express';
import { TagService } from '../services/tagService';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';

/**
 * 태그 목록 조회
 * GET /api/tags
 */
export async function getTags(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { includeCount } = req.query;
    const tagService = new TagService();
    const tags = await tagService.getTags(includeCount === 'true');

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { tags },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 태그 상세 조회
 * GET /api/tags/:id
 */
export async function getTagById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const tagService = new TagService();
    const tag = await tagService.getTagById(id);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { tag },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 태그 생성
 * POST /api/tags
 */
export async function createTag(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Name and slug are required',
      });
      return;
    }

    const tagService = new TagService();
    const tag = await tagService.createTag({ name, slug });

    res.status(HttpStatusCodes.CREATED).json({
      status: 'success',
      data: { tag },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 태그 삭제
 * DELETE /api/tags/:id
 */
export async function deleteTag(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const tagService = new TagService();
    await tagService.deleteTag(id);

    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}
