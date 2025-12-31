import { MediaRepo } from '../repositories/mediaRepository';
import { AppError } from '../middleware/errorHandler';

export class MediaService {
  async getMediaList(options?: {
    uploadedBy?: string;
    page?: number;
    limit?: number;
  }) {
    return await MediaRepo.findMany(options);
  }

  async getMediaById(id: string) {
    const media = await MediaRepo.findById(id);

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
    return await MediaRepo.create(data);
  }

  async deleteMedia(id: string) {
    const media = await MediaRepo.findById(id);

    if (!media) {
      const error = new Error('Media not found') as AppError;
      error.statusCode = 404;
      error.status = 'error';
      throw error;
    }

    await MediaRepo.delete(id);
  }
}
