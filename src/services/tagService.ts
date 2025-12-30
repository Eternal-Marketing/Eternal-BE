import { TagRepo } from '../repositories/tagRepository';
import { AppError } from '../middleware/errorHandler';

export class TagService {
  async getTags(includeCount = false) {
    return await TagRepo.findMany(includeCount);
  }

  async getTagById(id: string) {
    const tag = await TagRepo.findById(id);

    if (!tag) {
      const error = new Error('Tag not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return tag;
  }

  async createTag(data: { name: string; slug: string }) {
    // Check if name or slug already exists
    const existingByName = await TagRepo.findByName(data.name);
    if (existingByName) {
      const error = new Error('Tag name already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    const existingBySlug = await TagRepo.findBySlug(data.slug);
    if (existingBySlug) {
      const error = new Error('Tag slug already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    return await TagRepo.create(data);
  }

  async deleteTag(id: string) {
    const tag = await TagRepo.findById(id);

    if (!tag) {
      const error = new Error('Tag not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    await TagRepo.delete(id);
  }

  async findOrCreateTag(name: string, slug: string) {
    return await TagRepo.findOrCreate(name, slug);
  }
}
