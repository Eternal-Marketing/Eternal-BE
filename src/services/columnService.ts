import { ColumnRepo } from '../repositories/columnRepository';
import { ColumnStatus } from '../models/Column';
import { AppError } from '../middleware/errorHandler';

export class ColumnService {
  async getColumns(options: {
    status?: ColumnStatus;
    categoryId?: string;
    tagId?: string;
    search?: string;
    authorId?: string;
    page?: number;
    limit?: number;
    orderBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title';
    orderDirection?: 'asc' | 'desc';
  }) {
    return await ColumnRepo.findMany(options);
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
    tagIds?: string[];
  }) {
    // Check if slug already exists
    const existingColumn = await ColumnRepo.findBySlug(data.slug);
    if (existingColumn) {
      const error = new Error('Slug already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    const publishedAt =
      data.status === ColumnStatus.PUBLISHED ? new Date() : undefined;

    return await ColumnRepo.create({
      ...data,
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
      tagIds?: string[];
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

    // If slug is being updated, check if it's available
    if (data.slug && data.slug !== existingColumn.slug) {
      const slugExists = await ColumnRepo.findBySlug(data.slug);
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
      data.status === ColumnStatus.PUBLISHED &&
      existingColumn.status !== ColumnStatus.PUBLISHED
    ) {
      publishedAt = new Date();
    }

    return await ColumnRepo.update(id, {
      ...data,
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
