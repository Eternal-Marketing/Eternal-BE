import { ColumnRepo } from '../repositories/columnRepository';
import { CategoryRepo } from '../repositories/categoryRepository';
import { ColumnStatus } from '../models/Column';
import { AppError } from '../middleware/errorHandler';
import {
  type CategoryCode,
  CATEGORY_CODE_TO_SLUG,
} from '../common/types/category';

export class ColumnService {
  async getColumns(options: {
    status?: ColumnStatus;
    categoryId?: string;
    categoryCode?: CategoryCode;
    search?: string;
    authorId?: string;
    page?: number;
    limit?: number;
    orderBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title';
    orderDirection?: 'asc' | 'desc';
  }) {
    let categoryId = options.categoryId;
    if (options.categoryCode != null && categoryId == null) {
      const slug = CATEGORY_CODE_TO_SLUG[options.categoryCode];
      const category = slug ? await CategoryRepo.findBySlug(slug) : null;
      categoryId = category?.id;
    }
    return await ColumnRepo.findMany({ ...options, categoryId });
  }

  async getColumnById(id: string) {
    const column = await ColumnRepo.findById(id);

    if (!column) {
      const error = new Error('Column not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return column;
  }

  async getColumnBySlug(slug: string) {
    const column = await ColumnRepo.findBySlug(slug);

    if (!column) {
      const error = new Error('Column not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return column;
  }

  async createColumn(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    thumbnailUrl?: string;
    status: ColumnStatus;
    authorId: string;
    categoryId?: string;
    categoryCode?: CategoryCode;
  }) {
    // Check if slug already exists
    const existingColumn = await ColumnRepo.findBySlug(data.slug);
    if (existingColumn) {
      const error = new Error('Slug already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    let categoryId = data.categoryId;
    if (data.categoryCode != null) {
      const slug = CATEGORY_CODE_TO_SLUG[data.categoryCode];
      const category = slug ? await CategoryRepo.findBySlug(slug) : null;
      if (!category) {
        const error = new Error(
          'Category not found for the given categoryCode'
        ) as AppError;
        error.statusCode = 400;
        error.status = 'error';
        throw error;
      }
      categoryId = category.id;
    }

    const publishedAt =
      data.status === ColumnStatus.PUBLISHED ? new Date() : undefined;

    const { categoryCode: _drop, ...rest } = data;
    return await ColumnRepo.create({
      ...rest,
      categoryId,
      publishedAt,
    });
  }

  async updateColumn(
    id: string,
    data: {
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      thumbnailUrl?: string;
      status?: ColumnStatus;
      categoryId?: string | null;
      categoryCode?: CategoryCode;
    }
  ) {
    // Check if column exists
    const existingColumn = await ColumnRepo.findById(id);
    if (!existingColumn) {
      const error = new Error('Column not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    const updateData = { ...data };
    if (data.categoryCode != null) {
      const slug = CATEGORY_CODE_TO_SLUG[data.categoryCode];
      const category = slug ? await CategoryRepo.findBySlug(slug) : null;
      if (!category) {
        const error = new Error(
          'Category not found for the given categoryCode'
        ) as AppError;
        error.statusCode = 400;
        error.status = 'error';
        throw error;
      }
      updateData.categoryId = category.id;
      delete (updateData as { categoryCode?: CategoryCode }).categoryCode;
    }

    // If slug is being updated, check if it's available
    if (updateData.slug && updateData.slug !== existingColumn.slug) {
      const slugExists = await ColumnRepo.findBySlug(updateData.slug);
      if (slugExists) {
        const error = new Error('Slug already exists') as AppError;
        error.statusCode = 409;
        error.status = 'error';
        throw error;
      }
    }

    // If status is being changed to PUBLISHED and wasn't published before
    let publishedAt = existingColumn.publishedAt;
    if (
      updateData.status === ColumnStatus.PUBLISHED &&
      existingColumn.status !== ColumnStatus.PUBLISHED
    ) {
      publishedAt = new Date();
    }

    return await ColumnRepo.update(id, {
      ...updateData,
      publishedAt,
    });
  }

  async deleteColumn(id: string) {
    const column = await ColumnRepo.findById(id);

    if (!column) {
      const error = new Error('Column not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    await ColumnRepo.delete(id);
  }

  async updateStatus(id: string, status: ColumnStatus) {
    return await this.updateColumn(id, { status });
  }

  async incrementViewCount(id: string) {
    await ColumnRepo.incrementViewCount(id);
  }
}
