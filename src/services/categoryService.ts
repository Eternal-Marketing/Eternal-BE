import { CategoryRepo } from '../repositories/categoryRepository';
import { AppError } from '../middleware/errorHandler';

export class CategoryService {
  async getCategories(includeInactive = false) {
    return await CategoryRepo.findMany(includeInactive);
  }

  async getCategoryById(id: string) {
    const category = await CategoryRepo.findById(id);

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
    const existing = await CategoryRepo.findBySlug(data.slug);
    if (existing) {
      const error = new Error('Slug already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    return await CategoryRepo.create(data);
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
    const category = await CategoryRepo.findById(id);

    if (!category) {
      const error = new Error('Category not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    // If slug is being updated, check if it's available
    if (data.slug && data.slug !== category.slug) {
      const slugExists = await CategoryRepo.findBySlug(data.slug);
      if (slugExists) {
        const error = new Error('Slug already exists') as AppError;
        error.statusCode = 409;
        error.status = 'error';
        throw error;
      }
    }

    return await CategoryRepo.update(id, data);
  }

  async deleteCategory(id: string) {
    const category = await CategoryRepo.findById(id);

    if (!category) {
      const error = new Error('Category not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    await CategoryRepo.delete(id);
  }
}
