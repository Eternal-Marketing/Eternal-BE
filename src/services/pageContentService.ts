import { PrismaClient, ContentType } from '@prisma/client';
import { PageContentRepository } from '../repositories/pageContentRepository';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class PageContentService {
  private pageContentRepository: PageContentRepository;

  constructor() {
    this.pageContentRepository = new PageContentRepository(prisma);
  }

  async getAllContents() {
    return await this.pageContentRepository.findMany();
  }

  async getContentByKey(key: string) {
    const content = await this.pageContentRepository.findByKey(key);

    if (!content) {
      const error = new Error('Page content not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return content;
  }

  async updateContent(
    key: string,
    data: {
      title?: string;
      content?: string;
      type?: ContentType;
      isActive?: boolean;
    }
  ) {
    const existing = await this.pageContentRepository.findByKey(key);

    if (!existing) {
      const error = new Error('Page content not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return await this.pageContentRepository.update(key, data);
  }

  async upsertContent(data: {
    key: string;
    title?: string;
    content: string;
    type: ContentType;
    isActive?: boolean;
  }) {
    return await this.pageContentRepository.upsert(data);
  }
}

