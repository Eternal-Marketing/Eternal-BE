import { PageContentRepo } from '../repositories/pageContentRepository';
import { ContentType } from '../models/PageContent';
import { AppError } from '../middleware/errorHandler';

export class PageContentService {
  async getAllContents() {
    return await PageContentRepo.findMany();
  }

  async getContentByKey(key: string) {
    const content = await PageContentRepo.findByKey(key);

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
    const existing = await PageContentRepo.findByKey(key);

    if (!existing) {
      const error = new Error('Page content not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return await PageContentRepo.update(key, data);
  }

  async upsertContent(data: {
    key: string;
    title?: string;
    content: string;
    type: ContentType;
    isActive?: boolean;
  }) {
    return await PageContentRepo.upsert(data);
  }
}
