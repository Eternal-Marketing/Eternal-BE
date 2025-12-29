import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const { includeInactive } = req.query;
      const categories = await this.categoryService.getCategories(
        includeInactive === 'true'
      );

      res.status(200).json({
        status: 'success',
        data: { categories },
      });
    } catch (error) {
      throw error;
    }
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);

      res.status(200).json({
        status: 'success',
        data: { category },
      });
    } catch (error) {
      throw error;
    }
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, slug, description, parentId, order } = req.body;

      if (!name || !slug) {
        res.status(400).json({
          status: 'error',
          message: 'Name and slug are required',
        });
        return;
      }

      const category = await this.categoryService.createCategory({
        name,
        slug,
        description,
        parentId: parentId || null,
        order: order ? parseInt(order) : undefined,
      });

      res.status(201).json({
        status: 'success',
        data: { category },
      });
    } catch (error) {
      throw error;
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, slug, description, parentId, order, isActive } = req.body;

      const category = await this.categoryService.updateCategory(id, {
        name,
        slug,
        description,
        parentId: parentId !== undefined ? parentId : undefined,
        order: order ? parseInt(order) : undefined,
        isActive,
      });

      if (!category) {
        res.status(404).json({
          status: 'error',
          message: 'Category not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: { category },
      });
    } catch (error) {
      throw error;
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.categoryService.deleteCategory(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  };
}

