import { Request, Response } from 'express';
import { TagService } from '../services/tagService';

export class TagController {
  private tagService: TagService;

  constructor() {
    this.tagService = new TagService();
  }

  getTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const { includeCount } = req.query;
      const tags = await this.tagService.getTags(includeCount === 'true');

      res.status(200).json({
        status: 'success',
        data: { tags },
      });
    } catch (error) {
      throw error;
    }
  };

  getTagById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tag = await this.tagService.getTagById(id);

      res.status(200).json({
        status: 'success',
        data: { tag },
      });
    } catch (error) {
      throw error;
    }
  };

  createTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, slug } = req.body;

      if (!name || !slug) {
        res.status(400).json({
          status: 'error',
          message: 'Name and slug are required',
        });
        return;
      }

      const tag = await this.tagService.createTag({ name, slug });

      res.status(201).json({
        status: 'success',
        data: { tag },
      });
    } catch (error) {
      throw error;
    }
  };

  deleteTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.tagService.deleteTag(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  };
}

