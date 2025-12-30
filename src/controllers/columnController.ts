import { Request, Response, NextFunction } from 'express';
import { ColumnService } from '../services/columnService';
import { AuthRequest } from '../middleware/auth';
import { ColumnStatus } from '../models/Column';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';

/**
 * 칼럼 목록 조회
 * GET /api/columns
 */
export async function getColumns(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      status,
      categoryId,
      tagId,
      search,
      authorId,
      page = '1',
      limit = '10',
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = req.query;

    const columnService = new ColumnService();
    const result = await columnService.getColumns({
      status: status as ColumnStatus | undefined,
      categoryId: categoryId as string | undefined,
      tagId: tagId as string | undefined,
      search: search as string | undefined,
      authorId: authorId as string | undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      orderBy: orderBy as any,
      orderDirection: orderDirection as 'asc' | 'desc',
    });

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: {
        columns: result.columns,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 칼럼 ?�세 조회 (ID)
 * GET /api/columns/:id
 */
export async function getColumnById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { incrementView } = req.query;

    const columnService = new ColumnService();
    const column = await columnService.getColumnById(id);

    // Increment view count if requested (public views)
    if (incrementView === 'true') {
      await columnService.incrementViewCount(id);
      column.viewCount += 1;
    }

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { column },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 칼럼 ?�세 조회 (Slug)
 * GET /api/columns/slug/:slug
 */
export async function getColumnBySlug(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params;
    const { incrementView } = req.query;

    const columnService = new ColumnService();
    const column = await columnService.getColumnBySlug(slug);

    // Increment view count if requested (public views)
    if (incrementView === 'true') {
      await columnService.incrementViewCount(column.id);
      column.viewCount += 1;
    }

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { column },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 칼럼 ?�성
 * POST /api/columns
 */
export async function createColumn(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const {
      title,
      slug,
      content,
      excerpt,
      thumbnailUrl,
      status = 'DRAFT',
      categoryId,
      tagIds,
    } = req.body;

    if (!title || !slug || !content) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Title, slug, and content are required',
      });
      return;
    }

    const columnService = new ColumnService();
    const column = await columnService.createColumn({
      title,
      slug,
      content,
      excerpt,
      thumbnailUrl,
      status: status as ColumnStatus,
      authorId: req.admin.adminId,
      categoryId,
      tagIds: Array.isArray(tagIds) ? tagIds : undefined,
    });

    res.status(HttpStatusCodes.CREATED).json({
      status: 'success',
      data: { column },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 칼럼 ?�정
 * PUT /api/columns/:id
 */
export async function updateColumn(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      thumbnailUrl,
      status,
      categoryId,
      tagIds,
    } = req.body;

    const columnService = new ColumnService();
    const column = await columnService.updateColumn(id, {
      title,
      slug,
      content,
      excerpt,
      thumbnailUrl,
      status: status as ColumnStatus | undefined,
      categoryId,
      tagIds: Array.isArray(tagIds) ? tagIds : undefined,
    });

    if (!column) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        status: 'error',
        message: 'Column not found',
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { column },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 칼럼 ??��
 * DELETE /api/columns/:id
 */
export async function deleteColumn(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    const { id } = req.params;
    const columnService = new ColumnService();
    await columnService.deleteColumn(id);

    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}

/**
 * 칼럼 ?�태 변�?
 * PATCH /api/columns/:id/status
 */
export async function updateStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Status is required',
      });
      return;
    }

    const columnService = new ColumnService();
    const column = await columnService.updateStatus(id, status as ColumnStatus);

    if (!column) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        status: 'error',
        message: 'Column not found',
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { column },
    });
  } catch (error) {
    next(error);
  }
}
