import { PrismaClient } from '@prisma/client';
import { CategoryRepository } from '../repositories/categoryRepository';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository(prisma);
  }

  async getCategories(includeInactive = false) {
    return await this.categoryRepository.findMany(includeInactive);
  }

  async getCategoryById(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      const error = new Error('Category not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return category;
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string | null;
    order?: number;
  }) {
    // Check if slug already exists
    const existing = await this.categoryRepository.findBySlug(data.slug);
    if (existing) {
      const error = new Error('Slug already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    return await this.categoryRepository.create(data);
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: string | null;
      order?: number;
      isActive?: boolean;
    }
  ) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      const error = new Error('Category not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    // If slug is being updated, check if it's available
    if (data.slug && data.slug !== category.slug) {
      const slugExists = await this.categoryRepository.findBySlug(data.slug);
      if (slugExists) {
        const error = new Error('Slug already exists') as AppError;
        error.statusCode = 409;
        error.status = 'error';
        throw error;
      }
    }

    return await this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      const error = new Error('Category not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    await this.categoryRepository.delete(id);
  }
}

