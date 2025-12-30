import { PrismaClient } from '@prisma/client';
import { MediaRepository } from '../repositories/mediaRepository';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class MediaService {
  private mediaRepository: MediaRepository;

  constructor() {
    this.mediaRepository = new MediaRepository(prisma);
  }

  async getMediaList(options?: {
    uploadedBy?: string;
    page?: number;
    limit?: number;
  }) {
    return await this.mediaRepository.findMany(options);
  }

  async getMediaById(id: string) {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      const error = new Error('Media not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    return media;
  }

  async createMedia(data: {
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy: string;
  }) {
    return await this.mediaRepository.create(data);
  }

  async deleteMedia(id: string) {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      const error = new Error('Media not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    await this.mediaRepository.delete(id);
  }
}

