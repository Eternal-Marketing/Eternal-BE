import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';
import {
  validateCreateCategoryBody,
  validateUpdateCategoryBody,
} from '../validators/categoryValidator';

/**
 * 카테고리 목록 조회
 * GET /api/categories
 */
export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { includeInactive } = req.query;
    const categoryService = new CategoryService();
    const categories = await categoryService.getCategories(
      includeInactive === 'true'
    );

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 카테고리 상세 조회
 * GET /api/categories/:id
 */
export async function getCategoryById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const categoryService = new CategoryService();
    const category = await categoryService.getCategoryById(id);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 카테고리 생성
 * POST /api/categories
 */
export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validation = validateCreateCategoryBody(req.body);
    if (!validation.success) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: validation.message,
      });
      return;
    }

    const categoryService = new CategoryService();
    const category = await categoryService.createCategory(validation.payload);

    res.status(HttpStatusCodes.CREATED).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 카테고리 수정
 * PUT /api/categories/:id
 */
export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const validation = validateUpdateCategoryBody(req.body);
    if (!validation.success) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: validation.message,
      });
      return;
    }

    const categoryService = new CategoryService();
    const category = await categoryService.updateCategory(id, validation.payload);

    if (!category) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        status: 'error',
        message: 'Category not found',
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 카테고리 삭제
 * DELETE /api/categories/:id
 */
export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const categoryService = new CategoryService();
    await categoryService.deleteCategory(id);

    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}
