import { PrismaClient } from '@prisma/client';
import { TagRepository } from '../repositories/tagRepository';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class TagService {
  private tagRepository: TagRepository;

  constructor() {
    this.tagRepository = new TagRepository(prisma);
  }

  async getTags(includeCount = false) {
    return await this.tagRepository.findMany(includeCount);
  }

  async getTagById(id: string) {
    const tag = await this.tagRepository.findById(id);

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
    const existingByName = await this.tagRepository.findByName(data.name);
    if (existingByName) {
      const error = new Error('Tag name already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    const existingBySlug = await this.tagRepository.findBySlug(data.slug);
    if (existingBySlug) {
      const error = new Error('Tag slug already exists') as AppError;
      error.statusCode = 409;
      error.status = 'error';
      throw error;
    }

    return await this.tagRepository.create(data);
  }

  async deleteTag(id: string) {
    const tag = await this.tagRepository.findById(id);

    if (!tag) {
      const error = new Error('Tag not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    await this.tagRepository.delete(id);
  }

  async findOrCreateTag(name: string, slug: string) {
    return await this.tagRepository.findOrCreate(name, slug);
  }
}

