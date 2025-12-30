import { Request, Response } from 'express';
import { ColumnService } from '../services/columnService';
import { AuthRequest } from '../middleware/auth';
import { ColumnStatus } from '../models/Column';

export class ColumnController {
  private columnService: ColumnService;

  constructor() {
    this.columnService = new ColumnService();
  }

  getColumns = async (req: Request, res: Response): Promise<void> => {
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

      const result = await this.columnService.getColumns({
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

      res.status(200).json({
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
      throw error;
    }
  };

  getColumnById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { incrementView } = req.query;

      const column = await this.columnService.getColumnById(id);

      // Increment view count if requested (public views)
      if (incrementView === 'true') {
        await this.columnService.incrementViewCount(id);
        column.viewCount += 1;
      }

      res.status(200).json({
        status: 'success',
        data: { column },
      });
    } catch (error) {
      throw error;
    }
  };

  getColumnBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const { incrementView } = req.query;

      const column = await this.columnService.getColumnBySlug(slug);

      // Increment view count if requested (public views)
      if (incrementView === 'true') {
        await this.columnService.incrementViewCount(column.id);
        column.viewCount += 1;
      }

      res.status(200).json({
        status: 'success',
        data: { column },
      });
    } catch (error) {
      throw error;
    }
  };

  createColumn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.admin) {
        res.status(401).json({
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
        res.status(400).json({
          status: 'error',
          message: 'Title, slug, and content are required',
        });
        return;
      }

      const column = await this.columnService.createColumn({
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

      res.status(201).json({
        status: 'success',
        data: { column },
      });
    } catch (error) {
      throw error;
    }
  };

  updateColumn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.admin) {
        res.status(401).json({
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

      const column = await this.columnService.updateColumn(id, {
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
        res.status(404).json({
          status: 'error',
          message: 'Column not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: { column },
      });
    } catch (error) {
      throw error;
    }
  };

  deleteColumn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.admin) {
        res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
        return;
      }

      const { id } = req.params;
      await this.columnService.deleteColumn(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  };

  updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.admin) {
        res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          status: 'error',
          message: 'Status is required',
        });
        return;
      }

      const column = await this.columnService.updateStatus(
        id,
        status as ColumnStatus
      );

      if (!column) {
        res.status(404).json({
          status: 'error',
          message: 'Column not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: { column },
      });
    } catch (error) {
      throw error;
    }
  };
}
