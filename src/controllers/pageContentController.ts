import { Request, Response } from 'express';
import { PageContentService } from '../services/pageContentService';
import { ContentType } from '@prisma/client';

export class PageContentController {
  private pageContentService: PageContentService;

  constructor() {
    this.pageContentService = new PageContentService();
  }

  getAllContents = async (req: Request, res: Response): Promise<void> => {
    try {
      const contents = await this.pageContentService.getAllContents();

      res.status(200).json({
        status: 'success',
        data: { contents },
      });
    } catch (error) {
      throw error;
    }
  };

  getContentByKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      const content = await this.pageContentService.getContentByKey(key);

      res.status(200).json({
        status: 'success',
        data: { content },
      });
    } catch (error) {
      throw error;
    }
  };

  updateContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      const { title, content, type, isActive } = req.body;

      const updatedContent = await this.pageContentService.updateContent(key, {
        title,
        content,
        type: type as ContentType | undefined,
        isActive,
      });

      if (!updatedContent) {
        res.status(404).json({
          status: 'error',
          message: 'Page content not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: { content: updatedContent },
      });
    } catch (error) {
      throw error;
    }
  };

  upsertContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key, title, content, type, isActive } = req.body;

      if (!key || !content || !type) {
        res.status(400).json({
          status: 'error',
          message: 'Key, content, and type are required',
        });
        return;
      }

      const result = await this.pageContentService.upsertContent({
        key,
        title,
        content,
        type: type as ContentType,
        isActive,
      });

      res.status(200).json({
        status: 'success',
        data: { content: result },
      });
    } catch (error) {
      throw error;
    }
  };
}

