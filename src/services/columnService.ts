import { PrismaClient, ColumnStatus } from '@prisma/client';
import { ColumnRepository } from '../repositories/columnRepository';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class ColumnService {
  private columnRepository: ColumnRepository;

  constructor() {
    this.columnRepository = new ColumnRepository(prisma);
  }

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
    return await this.columnRepository.findMany(options);
  }

  async getColumnById(id: string) {
    const column = await this.columnRepository.findById(id);

    if (!column) {
      const error = new Error('Column not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return column;
  }

  async getColumnBySlug(slug: string) {
    const column = await this.columnRepository.findBySlug(slug);

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
    const existingColumn = await this.columnRepository.findBySlug(data.slug);
    if (existingColumn) {
      const error = new Error('Slug already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    const publishedAt =
      data.status === ColumnStatus.PUBLISHED ? new Date() : undefined;

    return await this.columnRepository.create({
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
    const existingColumn = await this.columnRepository.findById(id);
    if (!existingColumn) {
      const error = new Error('Column not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    // If slug is being updated, check if it's available
    if (data.slug && data.slug !== existingColumn.slug) {
      const slugExists = await this.columnRepository.findBySlug(data.slug);
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

    return await this.columnRepository.update(id, {
      ...data,
      publishedAt,
    });
  }

  async deleteColumn(id: string) {
    const column = await this.columnRepository.findById(id);

    if (!column) {
      const error = new Error('Column not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    await this.columnRepository.delete(id);
  }

  async updateStatus(id: string, status: ColumnStatus) {
    return await this.updateColumn(id, { status });
  }

  async incrementViewCount(id: string) {
    await this.columnRepository.incrementViewCount(id);
  }
}

