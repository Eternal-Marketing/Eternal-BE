import { Request, Response, NextFunction } from 'express';
import { PageContentService } from '../services/pageContentService';
import { ContentType } from '../models/PageContent';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';
import { validateUpsertPageContentBody } from '../validators/pageContentValidator';

/**
 * 페이지 컨텐츠 목록 조회
 * GET /api/page-content
 */
export async function getAllContents(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const pageContentService = new PageContentService();
    const contents = await pageContentService.getAllContents();

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { contents },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 페이지 컨텐츠 조회 (Key)
 * GET /api/page-content/:key
 */
export async function getContentByKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { key } = req.params;
    const pageContentService = new PageContentService();
    const content = await pageContentService.getContentByKey(key);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { content },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 페이지 컨텐츠 수정
 * PUT /api/page-content/:key
 */
export async function updateContent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { key } = req.params;
    const { title, content, type, isActive } = req.body;

    const pageContentService = new PageContentService();
    const updatedContent = await pageContentService.updateContent(key, {
      title,
      content,
      type: type as ContentType | undefined,
      isActive,
    });

    if (!updatedContent) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        status: 'error',
        message: 'Page content not found',
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { content: updatedContent },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 페이지 컨텐츠 생성 또는 수정
 * POST /api/page-content
 */
export async function upsertContent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validation = validateUpsertPageContentBody(req.body);
    if (!validation.success) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: validation.message,
      });
      return;
    }

    const pageContentService = new PageContentService();
    const result = await pageContentService.upsertContent(validation.payload);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { content: result },
    });
  } catch (error) {
    next(error);
  }
}
